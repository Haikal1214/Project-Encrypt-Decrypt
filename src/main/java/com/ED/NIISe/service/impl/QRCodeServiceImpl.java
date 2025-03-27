package com.ED.NIISe.service.impl;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ED.NIISe.model.PersonalInfo;
import com.ED.NIISe.service.QRCodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class QRCodeServiceImpl implements QRCodeService {

    private static final Logger logger = LoggerFactory.getLogger(QRCodeServiceImpl.class);

    @Value("${qr.code.size}")
    private int qrCodeSize;

    @Value("${qr.code.format}")
    private String qrCodeFormat;

    @Value("${qr.code.directory}")
    private String qrCodeDirectory;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private SecretKey secretKey;

    public QRCodeServiceImpl() throws NoSuchAlgorithmException {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256);
        this.secretKey = keyGen.generateKey();
    }

    @Override
    public String generateQRCode(PersonalInfo personalInfo) throws IOException {
        try {
            logger.info("Starting QR code generation for profile: {}", personalInfo.getId());
            
            if (personalInfo == null) {
                throw new IllegalArgumentException("PersonalInfo cannot be null");
            }
            
            // Encrypt the personal info
            String encryptedData = encryptData(personalInfo);
            logger.debug("Data encrypted successfully");
            
            // Create QR code writer
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            
            // Create QR code matrix
            BitMatrix bitMatrix = qrCodeWriter.encode(
                encryptedData,
                BarcodeFormat.QR_CODE,
                qrCodeSize,
                qrCodeSize
            );
            logger.debug("QR code matrix created successfully");

            // Generate unique filename
            String fileName = "qr_" + System.currentTimeMillis() + "." + qrCodeFormat.toLowerCase();
            Path directory = Paths.get(qrCodeDirectory).toAbsolutePath();
            logger.debug("Using directory: {}", directory);
            
            // Create directory if it doesn't exist
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
                logger.debug("Created directory: {}", directory);
            }
            
            Path filePath = directory.resolve(fileName);
            logger.debug("Generated file path: {}", filePath);
            
            // Write QR code to file
            MatrixToImageWriter.writeToPath(
                bitMatrix,
                qrCodeFormat,
                filePath
            );
            logger.info("QR code generated successfully at: {}", filePath);

            // Return the relative path for the frontend
            return "/" + qrCodeDirectory + "/" + fileName;
        } catch (WriterException e) {
            logger.error("Failed to generate QR code: {}", e.getMessage(), e);
            throw new IOException("Failed to generate QR code: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while generating QR code: {}", e.getMessage(), e);
            throw new IOException("Unexpected error while generating QR code: " + e.getMessage(), e);
        }
    }

    @Override
    public PersonalInfo readQRCode(String qrCodePath) throws IOException {
        try {
            Path path = Paths.get(qrCodePath);
            if (!Files.exists(path)) {
                logger.error("QR code file not found: {}", qrCodePath);
                throw new IOException("QR code file not found: " + qrCodePath);
            }
            return decryptData(qrCodePath);
        } catch (Exception e) {
            logger.error("Failed to read QR code: {}", e.getMessage(), e);
            throw new IOException("Failed to read QR code: " + e.getMessage(), e);
        }
    }

    @Override
    public String encryptData(PersonalInfo personalInfo) {
        try {
            // Convert PersonalInfo to JSON
            String jsonData = objectMapper.writeValueAsString(personalInfo);
            logger.debug("PersonalInfo converted to JSON: {}", jsonData);
            
            // Initialize cipher
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            // Encrypt the data
            byte[] encryptedBytes = cipher.doFinal(jsonData.getBytes(StandardCharsets.UTF_8));
            
            // Convert to Base64 string
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            logger.error("Failed to encrypt data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to encrypt data: " + e.getMessage(), e);
        }
    }

    @Override
    public PersonalInfo decryptData(String encryptedData) {
        try {
            // Decode Base64 string
            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
            
            // Initialize cipher
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            // Decrypt the data
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            
            // Convert to JSON string
            String jsonData = new String(decryptedBytes, StandardCharsets.UTF_8);
            
            // Convert JSON to PersonalInfo object
            return objectMapper.readValue(jsonData, PersonalInfo.class);
        } catch (Exception e) {
            logger.error("Failed to decrypt data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to decrypt data: " + e.getMessage(), e);
        }
    }
} 