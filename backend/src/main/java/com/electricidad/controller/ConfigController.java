package com.electricidad.controller;

import com.electricidad.service.OracleConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/config")
public class ConfigController {

    private final OracleConfigService oracleConfigService;

    public ConfigController(OracleConfigService oracleConfigService) {
        this.oracleConfigService = oracleConfigService;
    }

    @GetMapping("/oracle-ip")
    public ResponseEntity<Map<String, Object>> getOracleIpConfig() {
        Map<String, Object> status = oracleConfigService.getConfigStatus();
        return ResponseEntity.ok(status);
    }

    @PostMapping("/oracle-ip")
    public ResponseEntity<Map<String, Object>> updateOracleIpConfig(@RequestBody Map<String, Object> payload) {
        String oracleIp = (String) payload.get("oracleIp");
        Integer port = payload.get("port") != null ? Integer.parseInt(payload.get("port").toString()) : 1521;
        String serviceName = (String) payload.get("serviceName");

        Map<String, Object> result = oracleConfigService.updateAndTestConfig(oracleIp, port, serviceName);
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}
