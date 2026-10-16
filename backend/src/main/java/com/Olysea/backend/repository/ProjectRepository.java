
package com.Olysea.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Olysea.backend.model.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
