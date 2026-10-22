package com.Olysea.backend.service.olyseaservice;

import com.Olysea.backend.common.exception.ResourceNotFoundException;
import com.Olysea.backend.controller.olyseaservice.dto.OlyseaServiceRequest;
import com.Olysea.backend.controller.olyseaservice.dto.OlyseaServiceResponse;
import com.Olysea.backend.model.OlyseaService;
import com.Olysea.backend.repository.OlyseaServiceRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class OlyseaServiceService {

    private final OlyseaServiceRepository serviceRepository;

    public OlyseaServiceService(
            OlyseaServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    public List<OlyseaServiceResponse> getAllServices() {
        return serviceRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OlyseaServiceResponse getServiceById(Long id) {
        OlyseaService service = findService(id);
        return toResponse(service);
    }

    @Transactional
    public OlyseaServiceResponse createService(
            OlyseaServiceRequest request) {

        OlyseaService service = new OlyseaService();

        applyRequest(service, request);

        OlyseaService savedService = serviceRepository.save(service);

        return toResponse(savedService);
    }

    @Transactional
    public OlyseaServiceResponse updateService(
            Long id,
            OlyseaServiceRequest request) {

        OlyseaService service = findService(id);

        applyRequest(service, request);

        OlyseaService updatedService = serviceRepository.save(service);

        return toResponse(updatedService);
    }

    @Transactional
    public void deleteService(Long id) {
        OlyseaService service = findService(id);
        serviceRepository.delete(service);
    }

    private void applyRequest(OlyseaService service, OlyseaServiceRequest request) {
        service.setTitle(request.title().trim());
        service.setDescription(request.description().trim());
        service.setExtra(trimToNull(request.extra()));
        service.setTitleAr(trimToNull(request.titleAr()));
        service.setDescriptionAr(trimToNull(request.descriptionAr()));
        service.setExtraAr(trimToNull(request.extraAr()));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private OlyseaService findService(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service not found."));
    }

    private OlyseaServiceResponse toResponse(OlyseaService service) {
        return new OlyseaServiceResponse(
                service.getId(),
                service.getTitle(),
                service.getDescription(),
                service.getExtra(),
                service.getTitleAr(),
                service.getDescriptionAr(),
                service.getExtraAr(),
                service.getCreatedAt());
    }
}
