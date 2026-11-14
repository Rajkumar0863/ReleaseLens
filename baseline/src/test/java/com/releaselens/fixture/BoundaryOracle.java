package com.releaselens.fixture;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

/** Run manually as a follow-up oracle; intentionally excluded from default Surefire discovery. */
class BoundaryOracle {
    private final PaymentValidator validator = new PaymentValidator();

    @Test
    void rejectsZeroAmountAccordingToBusinessRequirement() {
        assertFalse(validator.isValid(BigDecimal.ZERO),
                "PR17-R1: zero-value payments must be rejected");
    }
}
