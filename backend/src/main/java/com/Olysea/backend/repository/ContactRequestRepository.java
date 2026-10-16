
package com.Olysea.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Olysea.backend.model.ContactRequest;

public interface ContactRequestRepository
                extends JpaRepository<ContactRequest, Long> {
}
