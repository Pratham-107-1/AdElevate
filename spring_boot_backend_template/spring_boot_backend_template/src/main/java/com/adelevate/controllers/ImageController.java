package com.adelevate.controllers;

import com.adelevate.dtos.images.AdImageDto;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

// ✅ Lists images vendors can pick from when posting an ad, backing the
// "Select Image" step in the ad-posting wizard. Files live in
// src/main/resources/static/ad-images/ and are served automatically by
// Spring Boot's static resource handling — this controller just tells the
// frontend what's currently in that folder.
//
// ✅ Also handles direct uploads now: the frontend no longer shows an
// in-app gallery of pre-set images. Instead the vendor picks a file from
// their own computer via the browser's native file dialog, and POSTs it
// here — see upload() below.
@RestController
@RequestMapping("/api/ad-images")
public class ImageController {

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "svg", "gif", "webp");

    @GetMapping
    public ResponseEntity<List<AdImageDto>> listImages() {
        List<AdImageDto> images = new ArrayList<>();
        try {
            ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            // classpath* works both when running from the IDE (loose files
            // under target/classes) and from a packaged JAR
            Resource[] resources = resolver.getResources("classpath*:/static/ad-images/*");

            for (Resource resource : resources) {
                String filename = resource.getFilename();
                if (filename == null) continue;

                String extension = filename.contains(".")
                        ? filename.substring(filename.lastIndexOf('.') + 1).toLowerCase()
                        : "";
                if (!IMAGE_EXTENSIONS.contains(extension)) continue; // skips README.md etc.

                images.add(new AdImageDto(filename, "/ad-images/" + filename));
            }
        } catch (Exception e) {
            // If the folder genuinely can't be read, return an empty list
            // rather than a 500 — the ad-posting form should still work,
            // just without pre-loaded image options.
            return ResponseEntity.ok(List.of());
        }

        images.sort((a, b) -> a.getFilename().compareToIgnoreCase(b.getFilename()));
        return ResponseEntity.ok(images);
    }

    // ✅ Vendor picks a file via the browser's native file dialog on the
    // frontend and it lands here. We save it into the same folder the GET
    // endpoint above reads from (target/classes/static/ad-images, which is
    // what Spring Boot is actually serving static files from at runtime),
    // and mirror it into src/main/resources/static/ad-images too so it
    // survives a rebuild/restart. Returns the URL the frontend should use
    // as the ad's productImage.
    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file selected."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please choose an image file."));
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase()
                : "";
        String filename = UUID.randomUUID() + extension;

        try {
            Path runtimeDir = Paths.get(System.getProperty("user.dir"), "target", "classes", "static", "ad-images");
            Files.createDirectories(runtimeDir);
            Files.copy(file.getInputStream(), runtimeDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            try {
                Path sourceDir = Paths.get(System.getProperty("user.dir"), "src", "main", "resources", "static", "ad-images");
                Files.createDirectories(sourceDir);
                Files.copy(file.getInputStream(), sourceDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ignored) {
                // Best-effort only — the runtime copy above is what actually
                // matters for the image to show up right now.
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not save the uploaded image."));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AdImageDto(filename, "/ad-images/" + filename));
    }
}
