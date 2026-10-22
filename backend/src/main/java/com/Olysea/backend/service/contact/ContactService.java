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

        // Honeypot check: silently ignore automated spam bot submission
        if (request.website() != null && !request.website().isBlank()) {
            ContactRequest fake = new ContactRequest();
            fake.setId(-1L);
            fake.setName(request.name());
            fake.setEmail(request.email());
            fake.setMessage(request.message());
            return toResponse(fake);
        }

        ContactRequest contact = new ContactRequest();
        contact.setName(request.name().trim());
        contact.setEmail(request.email().trim());
        contact.setBusiness(trimToNull(request.business()));
        contact.setType(trimToNull(request.type()));
        contact.setSubject(trimToNull(request.effectiveSubject()));
        contact.setMessage(request.message().trim());
        contact.setStatus("NEW");

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
    public ContactMessageResponse updateContactStatus(Long id, String status) {
        ContactRequest contact = findContact(id);
        if (status != null && !status.isBlank()) {
            contact.setStatus(status.trim().toUpperCase());
        }
        ContactRequest updated = contactRepository.save(contact);
        return toResponse(updated);
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

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private ContactMessageResponse toResponse(ContactRequest contact) {
        return new ContactMessageResponse(
                contact.getId(),
                contact.getName(),
                contact.getEmail(),
                contact.getBusiness(),
                contact.getType(),
                contact.getSubject(),
                contact.getMessage(),
                contact.getStatus() != null ? contact.getStatus() : "NEW",
                contact.getCreatedAt());
    }
}
