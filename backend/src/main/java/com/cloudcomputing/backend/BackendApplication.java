package com.cloudcomputing.backend;

import java.time.Clock;
import java.util.Map;

import com.cloudcomputing.backend.admin.AdminCommands;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

	// Admin commands use the same database as the API but close without starting an HTTP server.
	public static void main(String[] args) {
		var application = new SpringApplication(BackendApplication.class);
		boolean adminMode = args.length > 0 && "admin".equals(args[0]);
		if (adminMode) {
			application.setWebApplicationType(WebApplicationType.NONE);
			application.setDefaultProperties(Map.of(
					"spring.main.banner-mode", "off", "logging.level.root", "WARN"));
		}
		var context = application.run(args);
		if (adminMode) {
			int exitCode;
			try (context) {
				exitCode = context.getBean(AdminCommands.class)
						.execute(new DefaultApplicationArguments(args), System.out, System.err);
			}
			System.exit(exitCode);
		}
	}

	// Use UTC consistently for registration timestamps and invitation expiration.
	@Bean
	Clock registrationClock() {
		return Clock.systemUTC();
	}

}
