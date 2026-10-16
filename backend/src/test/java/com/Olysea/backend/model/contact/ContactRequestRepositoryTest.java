
package com.Olysea.backend.model.contact;

import com.Olysea.backend.model.ContactRequest;
import com.Olysea.backend.repository.ContactRequestRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ContactRequestRepositoryTest {

    @Autowired
    private ContactRequestRepository contactRequestRepository;

    @Test
    void shouldSaveAndFindContactRequest() {
        ContactRequest request = new ContactRequest();
        request.setName("Mohamed");
        request.setEmail("mohamed@example.com");
        request.setSubject("Website Inquiry");
        request.setMessage("I want a website for my business.");

        ContactRequest savedRequest = contactRequestRepository.saveAndFlush(request);

        assertNotNull(savedRequest.getId());

        ContactRequest foundRequest = contactRequestRepository
                .findById(savedRequest.getId())
                .orElseThrow();

        assertEquals("Mohamed", foundRequest.getName());
        assertEquals("mohamed@example.com", foundRequest.getEmail());
        assertEquals("Website Inquiry", foundRequest.getSubject());
        assertEquals(
                "I want a website for my business.",
                foundRequest.getMessage());
        assertNotNull(foundRequest.getCreatedAt());
    }

    @Test
    void shouldReturnEmptyWhenContactRequestDoesNotExist() {
        assertTrue(contactRequestRepository.findById(-1L).isEmpty());
    }
}
