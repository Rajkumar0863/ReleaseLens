
package com.releaselens;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DiffParserTest {

    @TempDir
    Path tempDir;

    @Test
    void detectsChangedBoundaryCondition() throws Exception {

        Path diff = tempDir.resolve("PR17.diff");

        Files.writeString(diff, """
            diff --git a/PaymentValidator.java b/PaymentValidator.java
            --- a/PaymentValidator.java
            +++ b/PaymentValidator.java
            @@ -9,6 +9,6 @@
             */
             public final class PaymentValidator {
                 public boolean isValid(BigDecimal amount) {
                     Objects.requireNonNull(amount, "amount");
            -        return amount.compareTo(BigDecimal.ZERO) > 0;
            +        return amount.compareTo(BigDecimal.ZERO) >= 0;
                 }
             }
            """);

        Set<Integer> result = DiffParser.changedLines(diff);

        assertEquals(Set.of(13), result);
    }

    @Test
    void ignoresNonJavaChanges() throws Exception {

        Path diff = tempDir.resolve("README.diff");

        Files.writeString(diff, """
            diff --git a/README.md b/README.md
            --- a/README.md
            +++ b/README.md
            @@ -1 +1 @@
            -Old documentation
            +New documentation
            """);

        assertTrue(DiffParser.changedLines(diff).isEmpty());
    }

    @Test
    void handlesMultipleHunks() throws Exception {

        Path diff = tempDir.resolve("multiple.diff");

        Files.writeString(diff, """
            diff --git a/Example.java b/Example.java
            --- a/Example.java
            +++ b/Example.java
            @@ -3,1 +3,1 @@
            -old
            +new
            @@ -20,1 +20,1 @@
            -old2
            +new2
            """);

        assertEquals(
            Set.of(3, 20),
            DiffParser.changedLines(diff)
        );
    }

    @Test
    void deletionsDoNotAdvanceNewLineCounter() throws Exception {

        Path diff = tempDir.resolve("deletion.diff");

        Files.writeString(diff, """
            diff --git a/Example.java b/Example.java
            --- a/Example.java
            +++ b/Example.java
            @@ -10,3 +10,2 @@
             first
            -removed
            +replacement
            """);

        assertEquals(
            Set.of(11),
            DiffParser.changedLines(diff)
        );
    }
}
