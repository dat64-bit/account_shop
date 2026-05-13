package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Integer> {

}
