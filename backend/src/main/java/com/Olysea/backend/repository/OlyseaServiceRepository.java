
package com.Olysea.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Olysea.backend.model.OlyseaService;

public interface OlyseaServiceRepository
                extends JpaRepository<OlyseaService, Long> {
}
