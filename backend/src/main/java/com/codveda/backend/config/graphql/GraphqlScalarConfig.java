package com.codveda.backend.config.graphql;

import graphql.language.FloatValue;
import graphql.language.IntValue;
import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

import java.math.BigDecimal;

@Configuration
public class GraphqlScalarConfig {

    @Bean
    RuntimeWiringConfigurer bigDecimalRuntimeWiringConfigurer() {
        GraphQLScalarType bigDecimalScalar = GraphQLScalarType.newScalar()
                .name("BigDecimal")
                .description("Arbitrary-precision signed decimal")
                .coercing(new Coercing<BigDecimal, String>() {
                    @Override
                    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        if (dataFetcherResult instanceof BigDecimal bigDecimal) {
                            return bigDecimal.toPlainString();
                        }
                        throw new CoercingSerializeException("Expected BigDecimal value");
                    }

                    @Override
                    public BigDecimal parseValue(Object input) throws CoercingParseValueException {
                        try {
                            return new BigDecimal(input.toString());
                        } catch (Exception ex) {
                            throw new CoercingParseValueException("Invalid BigDecimal input");
                        }
                    }

                    @Override
                    public BigDecimal parseLiteral(Object input) throws CoercingParseLiteralException {
                        if (input instanceof StringValue stringValue) {
                            try {
                                return new BigDecimal(stringValue.getValue());
                            } catch (Exception ex) {
                                throw new CoercingParseLiteralException("Invalid BigDecimal literal");
                            }
                        }
                        if (input instanceof IntValue intValue) {
                            return new BigDecimal(intValue.getValue());
                        }
                        if (input instanceof FloatValue floatValue) {
                            return floatValue.getValue();
                        }
                        throw new CoercingParseLiteralException("Expected BigDecimal string literal");
                    }
                })
                .build();

        return builder -> builder.scalar(bigDecimalScalar);
    }
}
