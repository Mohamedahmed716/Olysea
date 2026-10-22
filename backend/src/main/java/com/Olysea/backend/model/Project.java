package com.Olysea.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
public class Project {

    public Project(String name, String description, String url, String image) {
        this.name = name;
        this.description = description;
        this.url = url;
        this.image = image;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String category;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 5000)
    private String description;

    @Column(length = 2048)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String image;

    @Column(name = "preview_key", length = 100)
    private String previewKey;

    @Column(name = "category_ar", length = 100)
    private String categoryAr;

    @Column(name = "description_ar", length = 5000)
    private String descriptionAr;

    // Backward-compatibility accessors for title, projectUrl, imageUrl
    public String getTitle() {
        return name;
    }

    public void setTitle(String title) {
        this.name = title;
    }

    public String getProjectUrl() {
        return url;
    }

    public void setProjectUrl(String projectUrl) {
        this.url = projectUrl;
    }

    public String getImageUrl() {
        return image;
    }

    public void setImageUrl(String imageUrl) {
        this.image = imageUrl;
    }

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
