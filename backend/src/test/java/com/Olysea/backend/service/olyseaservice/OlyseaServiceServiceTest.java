package com.Olysea.backend.service.olyseaservice;

import com.Olysea.backend.common.exception.ResourceNotFoundException;
import com.Olysea.backend.controller.olyseaservice.dto.OlyseaServiceRequest;
import com.Olysea.backend.controller.olyseaservice.dto.OlyseaServiceResponse;
import com.Olysea.backend.model.OlyseaService;
import com.Olysea.backend.repository.OlyseaServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OlyseaServiceServiceTest {

    @Mock
    private OlyseaServiceRepository serviceRepository;

    private OlyseaServiceService serviceService;

    @BeforeEach
    void setUp() {
        serviceService = new OlyseaServiceService(serviceRepository);
    }

    @Test
    void createServiceTrimsAndPersistsService() {
        OlyseaServiceRequest request = new OlyseaServiceRequest(
                " Cloud Architecture ",
                " Scalable backend services ",
                " AWS / GCP ",
                " البنية السحابية ",
                " خدمات سحابية قابلة للتوسع ",
                " أمازون / جوجل ");

        when(serviceRepository.save(any(OlyseaService.class)))
                .thenAnswer(invocation -> {
                    OlyseaService s = invocation.getArgument(0);
                    s.setId(100L);
                    return s;
                });

        OlyseaServiceResponse response = serviceService.createService(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.title()).isEqualTo("Cloud Architecture");
        assertThat(response.description()).isEqualTo("Scalable backend services");
        assertThat(response.extra()).isEqualTo("AWS / GCP");
        assertThat(response.titleAr()).isEqualTo("البنية السحابية");
        verify(serviceRepository).save(any(OlyseaService.class));
    }

    @Test
    void getAllServicesReturnsOrderedList() {
        OlyseaService s1 = new OlyseaService();
        s1.setId(1L);
        s1.setTitle("Service 1");
        s1.setDescription("Desc 1");

        OlyseaService s2 = new OlyseaService();
        s2.setId(2L);
        s2.setTitle("Service 2");
        s2.setDescription("Desc 2");

        when(serviceRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(s2, s1));

        List<OlyseaServiceResponse> list = serviceService.getAllServices();

        assertThat(list).hasSize(2);
        assertThat(list.get(0).id()).isEqualTo(2L);
        assertThat(list.get(1).id()).isEqualTo(1L);
    }

    @Test
    void getServiceByIdReturnsService() {
        OlyseaService s = new OlyseaService();
        s.setId(5L);
        s.setTitle("SEO");
        s.setDescription("Search Engine Optimization");

        when(serviceRepository.findById(5L)).thenReturn(Optional.of(s));

        OlyseaServiceResponse response = serviceService.getServiceById(5L);

        assertThat(response.id()).isEqualTo(5L);
        assertThat(response.title()).isEqualTo("SEO");
    }

    @Test
    void getServiceByIdThrowsNotFound() {
        when(serviceRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> serviceService.getServiceById(999L));

        assertThat(ex.getMessage()).isEqualTo("Service not found.");
    }

    @Test
    void updateServiceModifiesExistingService() {
        OlyseaService s = new OlyseaService();
        s.setId(10L);
        s.setTitle("Old Title");
        s.setDescription("Old Description");

        when(serviceRepository.findById(10L)).thenReturn(Optional.of(s));
        when(serviceRepository.save(any(OlyseaService.class))).thenAnswer(i -> i.getArgument(0));

        OlyseaServiceRequest request = new OlyseaServiceRequest("New Title", "New Description");
        OlyseaServiceResponse response = serviceService.updateService(10L, request);

        assertThat(response.title()).isEqualTo("New Title");
        assertThat(response.description()).isEqualTo("New Description");
        verify(serviceRepository).save(s);
    }

    @Test
    void deleteServiceRemovesService() {
        OlyseaService s = new OlyseaService();
        s.setId(12L);
        s.setTitle("To Delete");
        s.setDescription("Will be deleted");

        when(serviceRepository.findById(12L)).thenReturn(Optional.of(s));

        serviceService.deleteService(12L);

        verify(serviceRepository).delete(s);
    }

    @Test
    void deleteServiceThrowsNotFoundWhenMissing() {
        when(serviceRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> serviceService.deleteService(404L));

        verify(serviceRepository, never()).delete(any(OlyseaService.class));
    }
}
