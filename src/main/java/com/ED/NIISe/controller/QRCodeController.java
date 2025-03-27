package com.ED.NIISe.controller;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;

@RestController
@RequestMapping("/api/qr")
public class QRCodeController {

    @PostMapping("/decode")
    public ResponseEntity<?> decodeQRCode(@RequestParam("file") MultipartFile file) {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IOException("Could not read image file");
            }

            LuminanceSource source = new BufferedImageLuminanceSource(image);
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

            Result result = new MultiFormatReader().decode(bitmap);

            Map<String, String> response = new HashMap<>();
            response.put("data", result.getText());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error reading image file: " + e.getMessage());
        } catch (com.google.zxing.NotFoundException e) {
            return ResponseEntity.badRequest().body("No QR code found in the image");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error decoding QR code: " + e.getMessage());
        }
    }
} 