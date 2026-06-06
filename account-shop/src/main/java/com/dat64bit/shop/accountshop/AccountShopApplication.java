package com.dat64bit.shop.accountshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableJpaAuditing
public class AccountShopApplication {

	@Bean
	public com.fasterxml.jackson.databind.ObjectMapper objectMapper() {
		return new com.fasterxml.jackson.databind.ObjectMapper();
	}

	public static void main(String[] args) {

		SpringApplication.run(AccountShopApplication.class, args);
	}

}