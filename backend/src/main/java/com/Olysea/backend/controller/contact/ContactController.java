
package com.Olysea.backend.controller.contact;

import com.Olysea.backend.controller.contact.dto.ContactMessageRequest;
import com.Olysea.backend.controller.contact.dto.ContactMessageResponse;
import com.Olysea.backend.service.contact.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/contact")
    public ResponseEntity<ContactMessageResponse> submitContact(
            @Valid @RequestBody ContactMessageRequest request) {

        ContactMessageResponse response = contactService.submitContact(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/admin/contacts")
    public ResponseEntity<List<ContactMessageResponse>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @GetMapping("/admin/contacts/{id}")
    public ResponseEntity<ContactMessageResponse> getContactById(
            @PathVariable Long id) {

        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @DeleteMapping("/admin/contacts/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}
