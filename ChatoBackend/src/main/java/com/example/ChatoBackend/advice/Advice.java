package com.example.ChatoBackend.advice;

import io.jsonwebtoken.ExpiredJwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice("com.example.ChatoBackend.controller")
public class Advice {

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<Void> handleExpiredJwtException() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }
}