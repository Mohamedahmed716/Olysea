package com.Olysea.backend.service.contact;

import com.Olysea.backend.common.exception.ResourceNotFoundException;
import com.Olysea.backend.controller.contact.dto.ContactMessageRequest;
import com.Olysea.backend.controller.contact.dto.ContactMessageResponse;
import com.Olysea.backend.model.ContactRequest;
import com.Olysea.backend.repository.ContactRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRequestRepository contactRepository;

    private ContactService contactService;

    @BeforeEach
    void setUp() {
        contactService = new ContactService(contactRepository);
    }

    @Test
    void submitContactSavesAndReturnsResponse() {
        ContactMessageRequest request = new ContactMessageRequest(
                " John Doe ",
                " john@example.com ",
                " Acme Corp ",
                " Web Development ",
                " Need a website ",
                " Please contact me to discuss a new platform. ",
                null);

        when(contactRepository.save(any(ContactRequest.class)))
                .thenAnswer(invocation -> {
                    ContactRequest saved = invocation.getArgument(0);
                    saved.setId(10L);
                    return saved;
                });

        ContactMessageResponse response = contactService.submitContact(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.name()).isEqualTo("John Doe");
        assertThat(response.email()).isEqualTo("john@example.com");
        assertThat(response.business()).isEqualTo("Acme Corp");
        assertThat(response.type()).isEqualTo("Web Development");
        assertThat(response.status()).isEqualTo("NEW");

        ArgumentCaptor<ContactRequest> captor = ArgumentCaptor.forClass(ContactRequest.class);
        verify(contactRepository).save(captor.capture());
        ContactRequest captured = captor.getValue();
        assertThat(captured.getName()).isEqualTo("John Doe");
        assertThat(captured.getEmail()).isEqualTo("john@example.com");
        assertThat(captured.getStatus()).isEqualTo("NEW");
    }

    @Test
    void submitContactHoneypotTriggeredReturnsFakeWithoutSaving() {
        ContactMessageRequest request = new ContactMessageRequest(
                "Bot Spammer",
                "spammer@bot.com",
                "Spam LLC",
                "Spam",
                "Free Money",
                "Click this link now for free gifts.",
                "http://spam-link.com");

        ContactMessageResponse response = contactService.submitContact(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(-1L);
        assertThat(response.name()).isEqualTo("Bot Spammer");
        verify(contactRepository, never()).save(any(ContactRequest.class));
    }

    @Test
    void getAllContactsReturnsListOrderedDesc() {
        ContactRequest contact1 = new ContactRequest("Alice", "alice@example.com", "Inquiry 1", "Message 1");
        contact1.setId(1L);
        ContactRequest contact2 = new ContactRequest("Bob", "bob@example.com", "Inquiry 2", "Message 2");
        contact2.setId(2L);

        when(contactRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of(contact2, contact1));

        List<ContactMessageResponse> result = contactService.getAllContacts();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(2L);
        assertThat(result.get(1).id()).isEqualTo(1L);
        verify(contactRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getContactByIdReturnsContactWhenFound() {
        ContactRequest contact = new ContactRequest("Charlie", "charlie@example.com", "Hi", "Greeting message");
        contact.setId(5L);

        when(contactRepository.findById(5L)).thenReturn(Optional.of(contact));

        ContactMessageResponse response = contactService.getContactById(5L);

        assertThat(response.id()).isEqualTo(5L);
        assertThat(response.name()).isEqualTo("Charlie");
    }

    @Test
    void getContactByIdThrowsNotFoundWhenMissing() {
        when(contactRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> contactService.getContactById(999L));

        assertThat(ex.getMessage()).isEqualTo("Contact message not found.");
    }

    @Test
    void updateContactStatusModifiesAndSavesStatus() {
        ContactRequest contact = new ContactRequest("Dave", "dave@example.com", "Sub", "Msg");
        contact.setId(7L);
        contact.setStatus("NEW");

        when(contactRepository.findById(7L)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any(ContactRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContactMessageResponse response = contactService.updateContactStatus(7L, "replied");

        assertThat(response.status()).isEqualTo("REPLIED");
        verify(contactRepository).save(contact);
    }

    @Test
    void deleteContactRemovesFromRepository() {
        ContactRequest contact = new ContactRequest("Eve", "eve@example.com", "Sub", "Msg");
        contact.setId(8L);

        when(contactRepository.findById(8L)).thenReturn(Optional.of(contact));

        contactService.deleteContact(8L);

        verify(contactRepository).delete(contact);
    }

    @Test
    void deleteMissingContactThrowsNotFound() {
        when(contactRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> contactService.deleteContact(404L));

        verify(contactRepository, never()).delete(any(ContactRequest.class));
    }
}
