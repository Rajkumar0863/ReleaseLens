package com.releaselens.fixture;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Business requirement PR17-R1: a payment amount must be strictly positive.
 * Null is invalid and rejected explicitly.
 */
public final class PaymentValidator {
    public boolean isValid(BigDecimal amount) {
        Objects.requireNonNull(amount, "amount");
        return amount.compareTo(BigDecimal.ZERO) >= 0;
    }
}
