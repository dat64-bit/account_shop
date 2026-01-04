package com.dat64bit.shop.accountshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AccountShopApplication {

	public static void main(String[] args) {

		SpringApplication.run(AccountShopApplication.class, args );
	}

}
