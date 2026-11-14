
package com.releaselens;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class EvidenceEngineTest {

    @TempDir
    Path dir;

    private void write(String name, String contents) throws Exception {
        Files.writeString(dir.resolve(name), contents);
    }

    @Test
    void parsesDiffNewsSideLineNumbers() throws Exception {
        write(
            "PR17.diff",
            "--- a/X.java\n"
                + "+++ b/X.java\n"
                + "@@ -9,3 +9,3 @@\n"
                + " context\n"
                + "-old\n"
                + "+new\n"
                + " context\n"
        );

        assertEquals(
            java.util.Set.of(10),
            new EvidenceEngine()
                .changedLines(dir.resolve("PR17.diff"))
        );
    }

    @Test
    void reviewUsesOnlyOrdinaryTestsAndPIT() throws Exception {
        write(
            "PR17.diff",
            "--- a/X.java\n"
                + "+++ b/X.java\n"
                + "@@ -12,1 +12,1 @@\n"
                + "-old\n"
                + "+new\n"
        );

        write(
            "ordinary-tests.xml",
            "<testsuite tests=\"2\" failures=\"0\" "
                + "errors=\"0\" skipped=\"0\"/>"
        );

        write(
            "mutations.xml",
            "<mutations>"
                + "<mutation detected=\"false\" "
                + "status=\"SURVIVED\" numberOfTestsRun=\"2\">"
                + "<sourceFile>X.java</sourceFile>"
                + "<mutatedClass>X</mutatedClass>"
                + "<mutatedMethod>isValid</mutatedMethod>"
                + "<methodDescription>()Z</methodDescription>"
                + "<lineNumber>12</lineNumber>"
                + "<mutator>"
                + "org.pitest.mutationtest.engine.gregor.mutators."
                + "ConditionalsBoundaryMutator"
                + "</mutator>"
                + "<index>0</index>"
                + "<blocks><block>0</block></blocks>"
                + "<description>changed conditional boundary</description>"
                + "</mutation>"
                + "</mutations>"
        );

        write(
            "boundary-oracle.xml",
            "not even XML; must never be read"
        );

        EvidenceEngine.Review result =
            new EvidenceEngine().review(dir);

        assertEquals("INVESTIGATE", result.status());
        assertEquals(2, result.testsPassed());
        assertEquals(0, result.testsFailed());
        assertEquals(1, result.mutantsSurvived());
        assertEquals(1, result.findings().size());

        assertEquals(
            "SURVIVING_BOUNDARY_MUTATION",
            result.findings().get(0).type()
        );

        assertEquals(
            "REVIEW_REQUIRED",
            result.findings().get(0).severity()
        );
    }

    @Test
    void survivingMutantOutsideDiffDoesNotTrigger()
        throws Exception {

        write(
            "PR17.diff",
            "--- a/X.java\n"
                + "+++ b/X.java\n"
                + "@@ -12,1 +12,1 @@\n"
                + "-old\n"
                + "+new\n"
        );

        write(
            "ordinary-tests.xml",
            "<testsuite tests=\"2\" failures=\"0\" "
                + "errors=\"0\" skipped=\"0\"/>"
        );

        write(
            "mutations.xml",
            "<mutations>"
                + "<mutation detected=\"false\" status=\"SURVIVED\">"
                + "<sourceFile>X.java</sourceFile>"
                + "<mutatedClass>X</mutatedClass>"
                + "<mutatedMethod>isValid</mutatedMethod>"
                + "<lineNumber>99</lineNumber>"
                + "<mutator>"
                + "org.pitest.mutationtest.engine.gregor.mutators."
                + "ConditionalsBoundaryMutator"
                + "</mutator>"
                + "</mutation>"
                + "</mutations>"
        );

        EvidenceEngine.Review result =
            new EvidenceEngine().review(dir);

        assertEquals("NO_CORRELATED_FINDING", result.status());
        assertTrue(result.findings().isEmpty());
    }
}
