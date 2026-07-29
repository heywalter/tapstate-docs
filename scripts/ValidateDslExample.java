// Parses a single DSL YAML example; used by check-doc-resource-examples.mjs.
import io.tapstate.core.dsl.DslParser;
import java.nio.charset.StandardCharsets;

/** Parser-only gate for one documentation resource example supplied on stdin. */
public final class ValidateDslExample {
    public static void main(String[] args) throws Exception {
        String yaml = new String(System.in.readAllBytes(), StandardCharsets.UTF_8);
        new DslParser().parse(yaml);
    }
}
