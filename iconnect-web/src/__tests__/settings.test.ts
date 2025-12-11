/**
 * @file __tests__/settings.test.ts
 * @description TDD tests for settings service - header image persistence
 * @changelog
 * - 2024-12-11: Initial TDD tests for header image
 */

// Mock Firebase modules
jest.mock('@/lib/firebase', () => ({
    getFirebaseDb: jest.fn(),
    getFirebaseStorage: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    onSnapshot: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
}));

import { uploadHeaderImage, getSettings, updateSettings } from '@/lib/services/settings';
import { getFirebaseStorage, getFirebaseDb } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

describe('Settings Service - Header Image Persistence', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadHeaderImage', () => {
        it('should upload image to Firebase Storage and return URL', async () => {
            // Arrange
            const mockFile = new File(['test'], 'header.png', { type: 'image/png' });
            const mockStorageRef = { name: 'mockRef' };
            const mockDownloadURL = 'https://firebasestorage.googleapis.com/header_123.jpg';

            (getFirebaseStorage as jest.Mock).mockReturnValue({});
            (ref as jest.Mock).mockReturnValue(mockStorageRef);
            (uploadBytes as jest.Mock).mockResolvedValue({});
            (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (doc as jest.Mock).mockReturnValue({});
            (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
            (updateDoc as jest.Mock).mockResolvedValue(undefined);

            // Act
            const result = await uploadHeaderImage(mockFile);

            // Assert
            expect(uploadBytes).toHaveBeenCalledWith(mockStorageRef, mockFile);
            expect(getDownloadURL).toHaveBeenCalledWith(mockStorageRef);
            expect(updateDoc).toHaveBeenCalled();
            expect(result).toBe(mockDownloadURL);
        });

        it('should save header URL to Firestore settings document', async () => {
            // Arrange
            const mockFile = new File(['test'], 'header.png', { type: 'image/png' });
            const mockDownloadURL = 'https://firebasestorage.googleapis.com/header_456.jpg';
            const mockDocRef = { id: 'app_config' };

            (getFirebaseStorage as jest.Mock).mockReturnValue({});
            (ref as jest.Mock).mockReturnValue({});
            (uploadBytes as jest.Mock).mockResolvedValue({});
            (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
            (updateDoc as jest.Mock).mockResolvedValue(undefined);

            // Act
            await uploadHeaderImage(mockFile);

            // Assert
            expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { headerImageUrl: mockDownloadURL });
        });
    });

    describe('getSettings', () => {
        it('should return settings with headerImageUrl from Firestore', async () => {
            // Arrange
            const mockSettings = {
                appName: 'iConnect',
                leaderName: 'Test Leader',
                headerImageUrl: 'https://example.com/header.jpg',
                alertSettings: { headsUp: true, action: true },
            };

            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (doc as jest.Mock).mockReturnValue({});
            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                data: () => mockSettings,
            });

            // Act
            const result = await getSettings();

            // Assert
            expect(result.headerImageUrl).toBe('https://example.com/header.jpg');
        });
    });

    describe('updateSettings', () => {
        it('should update settings in Firestore', async () => {
            // Arrange
            const mockDocRef = { id: 'app_config' };

            (getFirebaseDb as jest.Mock).mockReturnValue({});
            (doc as jest.Mock).mockReturnValue(mockDocRef);
            (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
            (updateDoc as jest.Mock).mockResolvedValue(undefined);

            // Act
            await updateSettings({ appName: 'New Name' });

            // Assert
            expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { appName: 'New Name' });
        });
    });
});
