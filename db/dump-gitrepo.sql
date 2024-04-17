-- gitrepo.cvedatabase definition

CREATE TABLE `cvedatabase` (
  `cve_id` varchar(500) NOT NULL,
  `cve_status` text NOT NULL,
  `cve_description` text NOT NULL,
  `cve_references` text,
  `cve_phase` text,
  `cve_votes` text,
  `cve_comments` text,
  PRIMARY KEY (`cve_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- gitrepo.dependecny_graph definition

CREATE TABLE `dependecny_graph` (
  `graph_hash` varchar(500) NOT NULL,
  `reponame` varchar(255) NOT NULL,
  `graphql_param` varchar(50) NOT NULL,
  `pullreq` int NOT NULL,
  `commits` int NOT NULL,
  `manifests` int NOT NULL,
  `dependencies` int NOT NULL,
  `rate_limit` int NOT NULL,
  `nodes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `edges` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `license_info` text NOT NULL,
  `releases` text NOT NULL,
  `languages` text NOT NULL,
  `forks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `pullreq_commits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`graph_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- gitrepo.dependecny_old definition

CREATE TABLE `dependecny_old` (
  `graph_hash` varchar(500) NOT NULL,
  `reponame` varchar(255) NOT NULL,
  `graphql_param` varchar(50) NOT NULL,
  `rate_limit` int NOT NULL,
  `nodes` text NOT NULL,
  `edges` text NOT NULL,
  `license_info` text NOT NULL,
  `releases` text NOT NULL,
  `languages` text NOT NULL,
  `forks` text NOT NULL,
  `pullreq_commits` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`graph_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- gitrepo.hash_dependency_graph definition

CREATE TABLE `hash_dependency_graph` (
  `graph_hash` varchar(500) NOT NULL,
  `reponame` varchar(255) NOT NULL,
  `graphql_param` varchar(50) NOT NULL,
  `pullreq` int NOT NULL,
  `commits` int NOT NULL,
  `manifests` int NOT NULL,
  `dependencies` int NOT NULL,
  `rate_limit` int NOT NULL,
  `nodes` varchar(500) NOT NULL,
  `edges` varchar(500) NOT NULL,
  `license_info` varchar(500) NOT NULL,
  `releases` varchar(500) NOT NULL,
  `languages` varchar(500) NOT NULL,
  `forks` varchar(500) NOT NULL,
  `pullreq_commits` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL,
  `blockchainTxnHash` varchar(1000) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `sbom` varchar(500) NOT NULL,
  PRIMARY KEY (`graph_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- gitrepo.keyword_staging definition

CREATE TABLE `keyword_staging` (
  `key_word` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- gitrepo.scan_vuln definition

CREATE TABLE `scan_vuln` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cve_id` varchar(500) NOT NULL,
  `source_url` varchar(1000) NOT NULL,
  `severity_level` varchar(255) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1088 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- gitrepo.stage_scan_vuln definition

CREATE TABLE `stage_scan_vuln` (
  `cve_id` varchar(500) NOT NULL,
  `source_url` varchar(500) NOT NULL,
  `severity_level` varchar(255) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- gitrepo.upload_signature definition

CREATE TABLE `upload_signature` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email_id` varchar(500) NOT NULL,
  `digital_signature` longtext NOT NULL,
  `public_key` longtext NOT NULL,
  `cipher_suite` varchar(255) NOT NULL,
  `verify_signature` longtext NOT NULL,
  `repo_url` varchar(500) NOT NULL,
  `repo_name` varchar(500) NOT NULL,
  `time_stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email_id`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- gitrepo.vulnerabilities definition

CREATE TABLE `vulnerabilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cve_id` varchar(500) NOT NULL,
  `already_retrieved` tinyint(1) NOT NULL,
  `already_analyzed` tinyint(1) NOT NULL,
  `Keywords_for_which_returned` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;