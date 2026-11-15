package com.electricidad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ElectricidadApplication {
    public static void main(String[] args) {
        SpringApplication.run(ElectricidadApplication.class, args);
    }
}
