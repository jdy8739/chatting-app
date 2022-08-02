package com.example.ChatoBackend.Utility;

import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.Date;

@Component
public class Utils {

    public byte[] extractImageByteData(byte[] bytes, int imageSize) {
        final int COMA = 44;
        final int MAX = (bytes.length - 1);
        byte[] imageByte = new byte[imageSize];
        StringBuilder stringBuilder = new StringBuilder();
        int count = 0;
        int integer;
        for (int i=0; i<bytes.length; i++) {
            if (i == MAX) stringBuilder.append((char) bytes[i]);
            if (bytes[i] == COMA) {
                integer = Integer.parseInt(stringBuilder.toString());
                imageByte[count++] = (byte) integer;
                stringBuilder.delete(0, stringBuilder.length());
            } else stringBuilder.append((char) bytes[i]);
        }
        return imageByte;
    }
}
