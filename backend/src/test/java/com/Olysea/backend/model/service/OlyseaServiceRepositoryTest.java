
package com.Olysea.backend.model.service;

import com.Olysea.backend.model.OlyseaService;
import com.Olysea.backend.repository.OlyseaServiceRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class OlyseaServiceRepositoryTest {

    @Autowired
    private OlyseaServiceRepository serviceRepository;

    @Test
    void shouldSaveAndFindService() {
        OlyseaService service = new OlyseaService();
        service.setTitle("Web Development");
        service.setDescription("Building modern websites");

        OlyseaService savedService = serviceRepository.saveAndFlush(service);

        assertNotNull(savedService.getId());

        OlyseaService foundService = serviceRepository
                .findById(savedService.getId())
                .orElseThrow();

        assertEquals("Web Development", foundService.getTitle());
        assertEquals("Building modern websites", foundService.getDescription());
        assertNotNull(foundService.getCreatedAt());
    }

    @Test
    void shouldReturnEmptyWhenServiceDoesNotExist() {
        assertTrue(serviceRepository.findById(-1L).isEmpty());
    }
}
