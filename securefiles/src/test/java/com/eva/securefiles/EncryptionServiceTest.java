package com.eva.securefiles;

import com.eva.securefiles.service.EncryptionService;
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

        @Test
        void testSamePlaintextProducesDifferentCiphertext() throws Exception {
            byte[] originalBytes = "Repeated content".getBytes();
            SecretKey key = encryptionService.generateKey();

            byte[] encrypted1 = encryptionService.encrypt(originalBytes, key);
            byte[] encrypted2 = encryptionService.encrypt(originalBytes, key);

            // Random IV means each encryption produces different output
            assertFalse(java.util.Arrays.equals(encrypted1, encrypted2));
        }
    }
