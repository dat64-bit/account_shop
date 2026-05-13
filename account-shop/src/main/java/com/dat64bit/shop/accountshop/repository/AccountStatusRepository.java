package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountStatusRepository extends JpaRepository<AccountStatus, Integer> {

}
