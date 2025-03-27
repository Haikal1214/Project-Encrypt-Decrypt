package com.ED.NIISe.service;

import java.io.IOException;

import com.ED.NIISe.model.PersonalInfo;

public interface QRCodeService {
    String generateQRCode(PersonalInfo personalInfo) throws IOException;
    PersonalInfo readQRCode(String qrCodePath) throws IOException;
    String encryptData(PersonalInfo personalInfo);
    PersonalInfo decryptData(String encryptedData);
} 