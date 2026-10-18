
package com.Olysea.backend.repository;

import com.Olysea.backend.model.OlyseaService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OlyseaServiceRepository
        extends JpaRepository<OlyseaService, Long> {

    List<OlyseaService> findAllByOrderByCreatedAtDesc();
}
