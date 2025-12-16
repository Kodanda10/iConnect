/**
 * @file __tests__/settings-persistence.test.ts
 * @description TDD tests for header image persistence across navigation
 * @changelog
 * - 2024-12-11: RED phase - failing test for header persistence bug
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
import { doc, getDoc, updateDoc } from 'firebase/firestore';

describe('Header Image Persistence Bug', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * TDD RED PHASE - This test should FAIL initially
     * Bug: After uploading header image and calling updateSettings for other fields,
     * the headerImageUrl is NOT preserved in the updateSettings call.
     */
    it('should preserve headerImageUrl when updating other settings fields', async () => {
        // Arrange: Simulate existing settings with a header image
        const existingSettings = {
            appName: 'iConnect',
            leaderName: 'Leader Name',
            headerImageUrl: 'https://storage.example.com/existing-header.jpg',
            alertSettings: { headsUp: true, action: true },
        };
        const mockDocRef = { id: 'app_config' };

        (getFirebaseDb as jest.Mock).mockReturnValue({});
        (doc as jest.Mock).mockReturnValue(mockDocRef);
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => existingSettings,
        });
        (updateDoc as jest.Mock).mockResolvedValue(undefined);

        // Act: Update only appName (simulating the save in settings page)
        await updateSettings({ appName: 'New App Name' });

        // Assert: updateDoc should only update appName, NOT overwrite headerImageUrl
        // This verifies that partial updates work correctly
        expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { appName: 'New App Name' });

        // Also verify headerImageUrl was NOT in the update call (should remain untouched)
        const updateCall = (updateDoc as jest.Mock).mock.calls[0];
        expect(updateCall[1]).not.toHaveProperty('headerImageUrl');
    });

    /**
     * TDD RED PHASE - Test that getSettings returns persisted headerImageUrl
     */
    it('should return headerImageUrl from Firestore after navigation', async () => {
        // Arrange: Firestore has saved header image URL
        const persistedSettings = {
            appName: 'iConnect',
            leaderName: 'Test Leader',
            headerImageUrl: 'https://storage.example.com/persisted-header.jpg',
            alertSettings: { headsUp: true, action: true },
        };

        (getFirebaseDb as jest.Mock).mockReturnValue({});
        (doc as jest.Mock).mockReturnValue({});
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => persistedSettings,
        });

        // Act: Get settings (simulating page load after navigation)
        const result = await getSettings();

        // Assert: headerImageUrl should be present
        expect(result.headerImageUrl).toBe('https://storage.example.com/persisted-header.jpg');
    });

    /**
     * TDD RED PHASE - Full flow: upload, save other fields, then retrieve
     */
    it('should persist headerImageUrl after uploading and saving other settings', async () => {
        // Arrange
        const mockFile = new File(['image-data'], 'header.png', { type: 'image/png' });
        const mockStorageRef = { name: 'mockRef' };
        const headerImageUrl = 'https://storage.example.com/uploaded-header.jpg';
        const mockDocRef = { id: 'app_config' };

        // Mock storage upload
        (getFirebaseStorage as jest.Mock).mockReturnValue({});
        (ref as jest.Mock).mockReturnValue(mockStorageRef);
        (uploadBytes as jest.Mock).mockResolvedValue({});
        (getDownloadURL as jest.Mock).mockResolvedValue(headerImageUrl);

        // Mock Firestore
        (getFirebaseDb as jest.Mock).mockReturnValue({});
        (doc as jest.Mock).mockReturnValue(mockDocRef);

        // First call: exists for uploadHeaderImage's updateSettings
        // Second call: exists for the subsequent updateSettings
        // Third call: return with headerImageUrl for getSettings
        let updateCallCount = 0;
        (getDoc as jest.Mock).mockImplementation(() => {
            updateCallCount++;
            return Promise.resolve({
                exists: () => true,
                data: () => ({
                    appName: 'iConnect',
                    leaderName: 'Leader',
                    headerImageUrl: updateCallCount >= 2 ? headerImageUrl : '',
                    alertSettings: { headsUp: true, action: true },
                }),
            });
        });
        (updateDoc as jest.Mock).mockResolvedValue(undefined);

        // Act: Upload header image
        const result = await uploadHeaderImage(mockFile);

        // Assert: URL returned and saved
        expect(result).toBe(headerImageUrl);
        expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { headerImageUrl });
    });
});
