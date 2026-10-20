
package com.Olysea.backend.controller.olyseaservice;

import com.Olysea.backend.controller.olyseaservice.dto.OlyseaServiceRequest;
import com.Olysea.backend.controller.olyseaservice.dto.OlyseaServiceResponse;
import com.Olysea.backend.service.olyseaservice.OlyseaServiceService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ServiceController {

    private final OlyseaServiceService serviceService;

    public ServiceController(OlyseaServiceService serviceService) {
        this.serviceService = serviceService;
    }

    // Public endpoints

    @GetMapping("/services")
    public ResponseEntity<List<OlyseaServiceResponse>> getAllServices() {
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<OlyseaServiceResponse> getServiceById(
            @PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    // Administrator endpoints

    @PostMapping("/admin/services")
    public ResponseEntity<OlyseaServiceResponse> createService(
            @Valid @RequestBody OlyseaServiceRequest request) {

        OlyseaServiceResponse response = serviceService.createService(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/admin/services/{id}")
    public ResponseEntity<OlyseaServiceResponse> updateService(
            @PathVariable Long id,
            @Valid @RequestBody OlyseaServiceRequest request) {

        return ResponseEntity.ok(
                serviceService.updateService(id, request));
    }

    @DeleteMapping("/admin/services/{id}")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long id) {

        serviceService.deleteService(id);

        return ResponseEntity.noContent().build();
    }
}
