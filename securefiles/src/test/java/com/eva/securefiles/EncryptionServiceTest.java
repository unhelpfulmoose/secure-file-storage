package com.eva.securefiles;

import org.junit.jupiter.api.Test;
import javax.crypto.SecretKey;
import static org.junit.jupiter.api.Assertions.*;

    class EncryptionServiceTest {

        private final EncryptionService encryptionService = new EncryptionService();

        @Test
        void testEncryptAndDecrypt() throws Exception {
            String originalText = "Hello, this is a test file!";
            byte[] originalBytes = originalText.getBytes();

            SecretKey key = encryptionService.generateKey();
            byte[] encrypted = encryptionService.encrypt(originalBytes, key);
            byte[] decrypted = encryptionService.decrypt(encrypted, key);

            assertArrayEquals(originalBytes, decrypted);
        }

        @Test
        void testEncryptedDataDiffersFromOriginal() throws Exception {
            String originalText = "Secret content";
            byte[] originalBytes = originalText.getBytes();

            SecretKey key = encryptionService.generateKey();
            byte[] encrypted = encryptionService.encrypt(originalBytes, key);

            assertFalse(java.util.Arrays.equals(originalBytes, encrypted));
        }

        @Test
        void testGenerateKeyNotNull() throws Exception {
            SecretKey key = encryptionService.generateKey();
            assertNotNull(key);
        }
    }
