package com.releaselens.fixture;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class PaymentValidatorTest {
    private final PaymentValidator validator = new PaymentValidator();

    @Test
    void acceptsPositiveAmount() {
        assertTrue(validator.isValid(new BigDecimal("10.00")));
    }

    @Test
    void rejectsNegativeAmount() {
        assertFalse(validator.isValid(new BigDecimal("-5.00")));
    }
}
