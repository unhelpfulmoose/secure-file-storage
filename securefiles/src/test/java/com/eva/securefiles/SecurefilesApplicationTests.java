package com.eva.securefiles;

import com.eva.securefiles.service.StorageService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class SecurefilesApplicationTests {

	@MockBean
	private StorageService storageService;

	@Test
	void contextLoads() {
	}

}
