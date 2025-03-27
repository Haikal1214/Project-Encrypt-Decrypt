package com.ED.NIISe.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ED.NIISe.model.PersonalInfo;
import com.ED.NIISe.repository.PersonalInfoRepository;
import com.ED.NIISe.service.PersonalInfoService;
import com.ED.NIISe.service.QRCodeService;

@Service
public class PersonalInfoServiceImpl implements PersonalInfoService {

    @Autowired
    private PersonalInfoRepository personalInfoRepository;

    @Autowired
    private QRCodeService qrCodeService;

    @Override
    public PersonalInfo savePersonalInfo(PersonalInfo personalInfo) {
        personalInfo.setCreatedAt(LocalDateTime.now());
        personalInfo.setUpdatedAt(LocalDateTime.now());
        return personalInfoRepository.save(personalInfo);
    }

    @Override
    public PersonalInfo getPersonalInfoById(Long id) {
        return personalInfoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal info not found with id: " + id));
    }

    @Override
    public List<PersonalInfo> getAllPersonalInfo() {
        return personalInfoRepository.findAll();
    }

    @Override
    public PersonalInfo updatePersonalInfo(Long id, PersonalInfo personalInfo) {
        PersonalInfo existingInfo = getPersonalInfoById(id);
        existingInfo.setName(personalInfo.getName());
        existingInfo.setEmail(personalInfo.getEmail());
        existingInfo.setAge(personalInfo.getAge());
        existingInfo.setAddress(personalInfo.getAddress());
        existingInfo.setUpdatedAt(LocalDateTime.now());
        return personalInfoRepository.save(existingInfo);
    }

    @Override
    public void deletePersonalInfo(Long id) {
        personalInfoRepository.deleteById(id);
    }

    @Override
    public String generateQRCode(PersonalInfo personalInfo) {
        try {
            String qrCodePath = qrCodeService.generateQRCode(personalInfo);
            personalInfo.setQrCodePath(qrCodePath);
            personalInfo.setEncryptedData(qrCodeService.encryptData(personalInfo));
            personalInfoRepository.save(personalInfo);
            return qrCodePath;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    @Override
    public PersonalInfo decryptQRCode(String qrCodeData) {
        try {
            return qrCodeService.decryptData(qrCodeData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt QR code data", e);
        }
    }
} 