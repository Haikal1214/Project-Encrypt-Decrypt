package com.ED.NIISe.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ED.NIISe.model.PersonalInfo;
import com.ED.NIISe.service.PersonalInfoService;

@RestController
@RequestMapping("/api/personal-info")
@CrossOrigin(origins = "*")
public class PersonalInfoController {

    private static final Logger logger = LoggerFactory.getLogger(PersonalInfoController.class);

    @Autowired
    private PersonalInfoService personalInfoService;

    @PostMapping
    public ResponseEntity<?> createPersonalInfo(@RequestBody PersonalInfo personalInfo) {
        try {
            PersonalInfo savedInfo = personalInfoService.savePersonalInfo(personalInfo);
            return ResponseEntity.ok(savedInfo);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to create profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonalInfo> getPersonalInfo(@PathVariable Long id) {
        return ResponseEntity.ok(personalInfoService.getPersonalInfoById(id));
    }

    @GetMapping
    public ResponseEntity<List<PersonalInfo>> getAllPersonalInfo() {
        return ResponseEntity.ok(personalInfoService.getAllPersonalInfo());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonalInfo> updatePersonalInfo(@PathVariable Long id, @RequestBody PersonalInfo personalInfo) {
        return ResponseEntity.ok(personalInfoService.updatePersonalInfo(id, personalInfo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersonalInfo(@PathVariable Long id) {
        personalInfoService.deletePersonalInfo(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/generate-qr")
    public ResponseEntity<?> generateQRCode(@PathVariable Long id) {
        try {
            logger.info("Generating QR code for profile ID: {}", id);
            PersonalInfo personalInfo = personalInfoService.getPersonalInfoById(id);
            if (personalInfo == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Profile not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            String qrCodePath = personalInfoService.generateQRCode(personalInfo);
            logger.info("QR code generated successfully for profile ID: {}", id);
            return ResponseEntity.ok(qrCodePath);
        } catch (Exception e) {
            logger.error("Failed to generate QR code for profile ID {}: {}", id, e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to generate QR code: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/decrypt-qr")
    public ResponseEntity<PersonalInfo> decryptQRCode(@RequestBody String qrCodeData) {
        return ResponseEntity.ok(personalInfoService.decryptQRCode(qrCodeData));
    }
} 