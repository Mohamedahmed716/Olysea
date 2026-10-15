
package com.Olysea.backend.contact.repository;

import com.Olysea.backend.contact.ContactRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRequestRepository
        extends JpaRepository<ContactRequest, Long> {
}
