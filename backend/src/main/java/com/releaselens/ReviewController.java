package com.releaselens;
import java.nio.file.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
 private final EvidenceEngine engine;
 @Value("${releaselens.evidence-dir:../evidence/pr17}") private String evidenceDir;
 public ReviewController(EvidenceEngine engine){this.engine=engine;}
 @GetMapping("/pr17")
 public EvidenceEngine.Review pr17() throws Exception {return engine.review(Path.of(evidenceDir));}
 @ExceptionHandler(Exception.class)
 public ResponseEntity<String> handle(Exception ex){
  return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(ex.getMessage());
 }
}
