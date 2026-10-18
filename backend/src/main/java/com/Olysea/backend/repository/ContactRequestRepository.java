
package com.Olysea.backend.repository;

import com.Olysea.backend.model.ContactRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRequestRepository
        extends JpaRepository<ContactRequest, Long> {

    List<ContactRequest> findAllByOrderByCreatedAtDesc();
}
