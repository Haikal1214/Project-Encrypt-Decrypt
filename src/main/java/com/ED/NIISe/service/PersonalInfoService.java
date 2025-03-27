package com.ED.NIISe.service;

import java.util.List;

import com.ED.NIISe.model.PersonalInfo;

public interface PersonalInfoService {
    PersonalInfo savePersonalInfo(PersonalInfo personalInfo);
    PersonalInfo getPersonalInfoById(Long id);
    List<PersonalInfo> getAllPersonalInfo();
    PersonalInfo updatePersonalInfo(Long id, PersonalInfo personalInfo);
    void deletePersonalInfo(Long id);
    String generateQRCode(PersonalInfo personalInfo);
    PersonalInfo decryptQRCode(String qrCodeData);
} 