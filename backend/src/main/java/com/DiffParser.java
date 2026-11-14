
package com.releaselens;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class DiffParser {

    private static final Pattern HUNK = Pattern.compile(
        "^@@ -\\d+(?:,\\d+)? \\+(\\d+)(?:,\\d+)? @@.*$"
    );

    private DiffParser() {
    }

    public static Set<Integer> changedLines(Path diffFile)
            throws IOException {

        Set<Integer> changed = new HashSet<>();

        int newLine = -1;
        boolean javaFile = false;

        for (String line : Files.readAllLines(diffFile)) {

            if (line.startsWith("diff --git ")) {
                javaFile = false;
                newLine = -1;
                continue;
            }

            if (line.startsWith("+++ ")) {
                String path = line.substring(4).trim();

                javaFile = path.endsWith(".java")
                        && !path.equals("/dev/null");

                newLine = -1;
                continue;
            }

            Matcher matcher = HUNK.matcher(line);

            if (matcher.matches()) {
                newLine = javaFile
                        ? Integer.parseInt(matcher.group(1))
                        : -1;
                continue;
            }

            if (!javaFile || newLine < 0) {
                continue;
            }

            if (line.startsWith("\\ No newline at end of file")) {
                continue;
            }

            if (line.startsWith("+")) {
                changed.add(newLine);
                newLine++;
            } else if (line.startsWith(" ")) {
                newLine++;
            } else if (line.startsWith("-")) {
                // Deletions do not advance the new-file line.
            }
        }

        return changed;
    }
}
