
package com.Olysea.backend.service.contact;

import com.Olysea.backend.common.exception.ResourceNotFoundException;
import com.Olysea.backend.controller.contact.dto.ContactMessageRequest;
import com.Olysea.backend.controller.contact.dto.ContactMessageResponse;
import com.Olysea.backend.model.ContactRequest;
import com.Olysea.backend.repository.ContactRequestRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ContactService {

    private final ContactRequestRepository contactRepository;

    public ContactService(ContactRequestRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @Transactional
    public ContactMessageResponse submitContact(
            ContactMessageRequest request) {

        ContactRequest contact = new ContactRequest();
        contact.setName(request.name().trim());
        contact.setEmail(request.email().trim());

        if (request.subject() != null) {
            contact.setSubject(normalizeSubject(request.subject()));
        }

        contact.setMessage(request.message().trim());

        ContactRequest saved = contactRepository.save(contact);

        return toResponse(saved);
    }

    public List<ContactMessageResponse> getAllContacts() {
        return contactRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ContactMessageResponse getContactById(Long id) {
        return toResponse(findContact(id));
    }

    @Transactional
    public void deleteContact(Long id) {
        ContactRequest contact = findContact(id);
        contactRepository.delete(contact);
    }

    private ContactRequest findContact(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Contact message not found."));
    }

    private String normalizeSubject(String subject) {
        if (subject.isBlank()) {
            return null;
        }

        return subject.trim();
    }

    private ContactMessageResponse toResponse(ContactRequest contact) {
        return new ContactMessageResponse(
                contact.getId(),
                contact.getName(),
                contact.getEmail(),
                contact.getSubject(),
                contact.getMessage(),
                contact.getCreatedAt());
    }
}
