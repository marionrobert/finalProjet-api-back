-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Hôte : db.3wa.io
-- Généré le : jeu. 28 mars 2024 à 14:29
-- Version du serveur :  5.7.33-0ubuntu0.18.04.1-log
-- Version de PHP : 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `marionrobert_3waproject`
--

-- --------------------------------------------------------

--
-- Structure de la table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `authorIsProvider` int(11) NOT NULL,
  `title` varchar(80) NOT NULL,
  `description` varchar(200) NOT NULL,
  `address` varchar(120) NOT NULL,
  `zip` varchar(6) NOT NULL,
  `city` varchar(45) NOT NULL,
  `lat` varchar(45) NOT NULL,
  `lng` varchar(45) NOT NULL,
  `status` varchar(45) DEFAULT 'waiting_for_validation',
  `duration` int(11) NOT NULL,
  `urlPicture` varchar(200) DEFAULT NULL,
  `points` int(11) NOT NULL,
  `creationTimestamps` datetime NOT NULL,
  `updatingTimestamps` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `activities`
--

INSERT INTO `activities` (`id`, `category_id`, `author_id`, `authorIsProvider`, `title`, `description`, `address`, `zip`, `city`, `lat`, `lng`, `status`, `duration`, `urlPicture`, `points`, `creationTimestamps`, `updatingTimestamps`) VALUES
(1, 3, 8, 1, 'Donne cours de Français', 'Donne cours de français pour apprendre les bases. au programme: vocabulaire, conjugaison, etc.', '2500 Chemin de Polytechnique ', 'H3T1J4', 'Montréal', '45.5045875', '-73.612996', 'online', 60, 'harmony/activities/loveTolearn_hz0qw2', 2, '2023-08-03 20:03:22', '2024-01-05 13:12:33'),
(2, 7, 8, 0, 'Besoin d\'un coup de main pour du jardinage', 'J\'aime jardiner mais je n\'ai vraiment pas la main verte! J\'aurais besoin d\'un coup de pouce pour entretenir les plantes de votre jardin et apprendre à m\'en occuper correctement!', '1690 Av de l\'Église', 'H4E1G5', 'Montréal', '45.46352596233766', '-73.58616616753247', 'online', 90, 'harmony/activities/garden2_tmcxzc', 3, '2023-08-03 20:06:13', '2023-09-12 15:51:46'),
(3, 4, 9, 0, 'Donne cours de couture', 'Passionnée de couture, je serais ravie de vous apprendre à faire ou refaire un ourlet, etc!', '6400 16e Avenue', 'H1X2S9', 'Montréal', '45.5572334', '-73.579836', 'online', 90, 'harmony/activities/sewing_lhpdln', 3, '2023-08-03 20:08:58', '2024-09-02 12:04:52'),
(5, 2, 9, 1, 'Visite du centre-ville', 'Je suis née à dans cette ville et y ai toujours vécu. Je connais le centre comme ma poche, je serais ravie de vous faire découvrir ma ville natale.', '1193 R. du Square-Phillips', 'H3B3C9', 'Montréal', '45.5041227', '-73.5687457', 'waiting_for_validation', 90, 'harmony/activities/vieux_monteal_dxodsx', 3, '2023-08-08 12:58:08', '2024-03-25 09:51:11'),
(7, 6, 9, 0, 'Besoin d\'explications sur le réseau de transports', 'J\'ai besoin que l\'on m\'explique comment fonctionne le réseau de transports à Angers. Je suis perdue! Et aussi qu\'on m\'aide à choisir et créer le meilleur titre de transports.', '405 Rue Sainte-Catherine Est', 'H2L2C4', 'Montréal', '45.5138895', '-73.5604723', 'online', 60, 'harmony/activities/metro_r5r9su', 2, '2023-08-03 20:03:22', '2024-01-02 19:56:44'),
(8, 1, 10, 0, 'Covoiturage Lasalle-Montréal centre', 'Je propose du covoiturage entre Lasalle et Montréal centre le matin.', '7755 Rue Bouvier', 'H8N2G6', 'LaSalle', '45.4314203', '-73.6126415', 'online', 30, 'harmony/activities/covoiturage_sriaxh', 1, '2023-08-03 20:03:22', '2024-01-02 12:11:48'),
(9, 3, 13, 1, 'Donne cours de Portugais', 'Je vous propose d\'apprendre le portugais. Je suis bilingue: toute ma famille paternelle est portugaise.', '1051 Rue Sanguinet Montréal', 'H2X3E4', 'Montréal', '45.51135465\r\n', '-73.55692266105899', 'online', 60, 'harmony/activities/portugal_exaggl', 2, '2023-08-03 20:03:22', '2024-09-02 12:22:11'),
(10, 4, 10, 0, 'Besoin cours de dressage pour chien', 'J\'ai des difficultés à élever mon chien. j\'aurais besoin quelqu\'un m\'aide à le dresser svp.', '7523 Bd LaSalle', 'H4H1R4', 'Verdun', '45.4725322', '-73.5696617', 'online', 120, 'harmony/activities/dog_nmtnqq', 4, '2023-08-03 20:03:22', '2024-01-02 12:20:24'),
(11, 16, 10, 0, 'Besoin d\'un coup de main pour le jardinage', 'Je n\'arrive pas à entretenir mon jardin et j\'aimerais faire un potager chez moi. Je ne sais pas par où commencer!', '6071 Rue Laurendeau', 'H4E3X6', 'Montréal', '45.4579004', '-73.5885067', 'online', 90, 'harmony/activities/garden_ao1els', 3, '2023-08-03 20:03:22', '2024-01-02 12:19:31'),
(12, 4, 10, 0, 'Besoin cours de Yoga', 'J\'ai découvert le yoga lors d\'un cours d\'initiation à mon travail et j\'ai adoré! Je souhaite maintenant approfondir la pratique du yoga et je recherche un.e prof pour m\'apprendre les bases!', '3400 Boul des Trinitaires', 'H4E4J3', 'Montréal', '45.4421195', '-73.6088672', 'online', 90, 'harmony/activities/yoga_dyubxm', 3, '2023-08-31 10:53:01', '2024-01-02 12:09:39'),
(16, 3, 10, 0, 'Besoin cours de portugais', 'Ma belle famille est portugaise et j\'aimerais leur faire la surprise d\'apprendre le protugais.', '1111 Rue Lapierre', 'H8N2J4', 'LaSalle', '45.43620265', '-73.60544000484967', 'online', 60, 'harmony/activities/portugal_yqetrj', 2, '2023-08-31 10:58:29', '2024-01-02 12:21:08'),
(19, 4, 10, 1, 'Footing guidé', 'Je cours 3 fois par semaine depuis 2 ans maintenant. Je peux vous aider à débuter et trouver votre rythme.', '7503 Bd de la Vérendrye', 'H4E4J3', 'Montréal', '45.4297396', '-73.6103733', 'online', 120, 'harmony/activities/jogging_jwe5kc', 4, '2023-08-31 12:09:20', '2024-01-02 12:22:01'),
(22, 4, 10, 0, 'Souhaite cours de pâtisserie orientale', 'J\'adore les pâtisseries orientales mais je n\'arrive pas à les faire moi-même. C\'est un savoir-faire que j\'aimerais apprendre !', '3325 Rue Allard', 'H4E2N3', 'Montréal', '45.44960981818182', '-73.60245238181818', 'online', 60, 'harmony/activities/baklava2_cltfli', 2, '2023-09-01 10:10:00', '2024-01-02 12:16:34'),
(25, 5, 14, 0, 'Besoin d\'un cours d\'informatique', 'Je suis un peu dépassée avec les nouvelles technologies mais j\'aimerais apprendre pour impressionner mes enfants et petits-enfants !', '312 R. du Square-Saint-Louis', 'H2X1A5', 'Montréal', '45.51674463333333', '-73.56937883333333', 'online', 90, 'harmony/activities/computer_kwbmqb', 3, '2023-09-12 10:13:59', '2024-09-02 10:21:32'),
(26, 3, 14, 0, 'Besoin cours d\'Espagnol', 'Mon beau-fils est espagnol et j\'aimerais beaucoup pouvoir apprendre sa langue pour pouvoir communiquer plus facilement avec ses parents.', '1 Rue Notre Dame E', 'H2Y1B6', 'Montréal', '45.5069845', '-73.55611438742501', 'online', 120, 'harmony/activities/spanish_fhz2zk', 4, '2023-09-12 10:16:51', '2023-09-12 10:16:51'),
(27, 1, 14, 0, 'Besoin traduction français/wolof pour un rdv administratif', 'J\'aurais besoin que quelqu\'un m\'accompagne à un rendez-vous à la préfecture pour traduire en cas de besoin.', '311 Rue St Thomas', 'J4R1Y2', 'Saint-Lambert', '45.4905219', '-73.5036661', 'online', 90, 'harmony/activities/administration_x91epu', 3, '2023-09-12 14:41:52', '2023-09-12 14:51:29'),
(28, 3, 14, 1, 'Cours de cuisine sénégalaise', 'Je peux vous apprendre à cuisiner les plats traditionnels sénégalais : thiéboudienne, thiakry, mafé, poulet yassa, etc !', '660 Av. Oak', 'J4P2R6', 'Saint-Lambert', '45.5032198', '-73.50370714862706', 'online', 90, 'harmony/activities/senegal_food_x88ist', 3, '2023-09-12 14:45:16', '2023-09-12 14:45:16'),
(29, 4, 14, 1, 'Cours de salsa', 'Passionnée de salsa depuis 3 ans, je pratique cette danse deux fois par semaine. Je serai ravie de vous en apprendre les bases!', '945 Ch. de Chambly', 'J4H3M6', 'Longueuil', '45.5065646', '-73.4276149', 'online', 90, 'harmony/activities/salsa_crweqg', 3, '2023-09-12 14:48:18', '2023-09-12 14:48:18'),
(30, 3, 16, 1, 'Soutien scolaire pour élèves de primaire', 'Je suis étudiant et j\'aimerais devenir professeur des écoles. J\'aimerais aider des élèves de primaire à faire leurs devoirs et/ou réapprendre certaines notions non comprises.', '7999 Bd des Galeries d\'Anjou', 'H1M1W9', 'Montréal', '45.6017033', '-73.564762', 'online', 60, 'harmony/activities/school_homework_rzovab', 2, '2023-09-12 15:04:22', '2024-09-02 15:04:22'),
(31, 3, 16, 1, 'Donne cours d\'informatique', 'J\'adore les nouvelles technologies et je suis toujours prêt à donner un coup de main à ceux pour qui elles restent énigmatiques!', '4445 Rue Ontario', 'H1V3V3', 'Montréal', '45.553902050000005', '-73.53925219544526', 'online', 90, 'harmony/activities/computers_xt2pvh', 3, '2023-09-12 15:06:18', '2023-09-12 15:06:18'),
(32, 4, 17, 0, 'Souhaite visite guidée du Musée des beaux Arts', 'J\'adorerais visiter le musée des beaux arts et j\'aimerais pouvoir le faire avec un.une passionné.e !', '1380 Rue Sherbrooke', 'H3G1J5', 'Montréal', '45.4450418', '-73.6767384', 'online', 180, 'harmony/activities/musee_beaux_arts_qiunml', 6, '2023-09-12 15:16:37', '2024-01-02 19:45:34'),
(33, 2, 17, 0, 'Découverte de Montréal', 'Nouvelle sur Montréal, j\'aimerais que quelqu\'un me fasse visiter les coins à ne pas manquer!', '110 R. Notre Dame', 'H2Y1T1', 'Montréal', '45.5044426', '-73.5560061', 'online', 150, 'harmony/activities/montreal_g1rkw7', 5, '2023-09-12 15:19:11', '2024-01-02 19:50:19'),
(34, 4, 17, 1, 'Donne cours de peinture', 'Ma grand-mère était peintre de profession et m\'a beaucoup appris. j\'aimerais à mon tour transmettre son savoir-faire!', '6595 A Rue Saint-Urbain', 'H2S3G6', 'Montréal', '45.5082487\r\n', '-73.56375', 'online', 120, 'harmony/activities/art_painting_h0btfi', 4, '2023-09-12 15:21:36', '2023-09-12 15:21:36'),
(35, 5, 18, 1, 'Donne coup de main peinture', 'Mon père était peintre en bâtiment de formation, je serais ravie de vous donner un coup de main si vous avez besoin de repeindre une pièce chez vous!', '1602 Rue de Bellechasse', 'H2G1N6', 'Montréal', '45.53864835', '-73.59495485668876', 'online', 150, 'harmony/activities/painting_ynmmnf', 5, '2023-09-12 15:40:54', '2024-09-02 15:40:54'),
(36, 5, 18, 1, 'Donne coup de main pour bricolage', 'Je suis bricoleur, je peux vous donner un coup de main pour toutes sortes de réparation!', '5621 Av. McMurray', 'H4W2G1', 'Côte Saint-Luc', '45.4632818\r\n', '-73.6665845', 'online', 90, 'harmony/activities/bricolage_vl34z0', 3, '2023-09-12 15:42:53', '2023-09-12 15:42:53'),
(37, 10, 18, 0, 'Souhaite apprendre à faire des macarons', 'J\'adore les macarons mais je n\'ai jamais réussi à en faire ! Qui peut m\'apprendre ?', '21 Rue Applewood', 'H3X3V5', 'Hampstead', '45.4793308', '-73.65183758923007', 'online', 150, 'harmony/activities/macarons_fyviuz', 5, '2023-09-12 15:45:06', '2023-09-12 15:45:06'),
(38, 1, 10, 1, 'Trajet Lasalle - Mirabel', 'Je fais le trajet Lasalle Mirabel régulièrement pour profiter des bonnes affaires du Premium Outlet.', '1501 Rue Serre', 'H8N1N2', 'LaSalle', '45.4319555', '-73.6213725', 'online', 60, 'harmony/activities/voiture_c44idd', 2, '2023-09-25 18:10:11', '2024-01-05 13:09:23'),
(40, 10, 10, 1, 'Donne cours de cuisine française', 'J\'adore la cuisine française : boeuf bourguignon, blanquette de dinde. Ce sont des recettes que je tiens de ma grand-mère. Je serais ravie de les partager avec vous !', '1741 Rue de Biencourt', 'H4E T4', 'Montréal', '45.4587131', '-73.5881156', 'online', 150, 'harmony/activities/french-food_nrghzl', 5, '2023-10-09 17:38:01', '2024-01-02 12:28:51'),
(41, 13, 10, 0, 'Besoin cours de tennis', 'J\'apprécie beaucoup le tennis mais je ne suis vraiment pas douée. J\'aimerais apprendre d\'un.e passionné.e !', '1098 Av. Brown', 'H4H2A8', 'Verdun', '45.44831880492958', '-73.57937192676056', 'online', 120, 'harmony/activities/tennis_zzmrxo', 4, '2023-10-09 21:21:17', '2024-01-02 15:38:39');

-- --------------------------------------------------------

--
-- Structure de la table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `booker_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `activity_title` varchar(80) NOT NULL,
  `points` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `beneficiary_id` int(11) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'waiting_for_acceptance',
  `providerValidation` tinyint(1) NOT NULL DEFAULT '0',
  `beneficiaryValidation` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `bookings`
--

INSERT INTO `bookings` (`id`, `booker_id`, `activity_id`, `activity_title`, `points`, `provider_id`, `beneficiary_id`, `status`, `providerValidation`, `beneficiaryValidation`) VALUES
(2, 7, 3, 'Donne cours de couture', 3, 9, 7, 'finished', 1, 1),
(3, 8, 7, 'Besoin d\'explications sur le réseau de transports', 2, 8, 9, 'finished', 1, 1),
(4, 8, 1, 'Donne cours de Français', 3, 8, 9, 'finished', 1, 1),
(5, 10, 5, 'Visite du centre-ville', 3, 9, 10, 'finished', 1, 1),
(6, 10, 3, 'Donne cours de couture', 3, 9, 10, 'finished', 1, 1),
(7, 10, 1, 'Donne cours de Français', 3, 8, 10, 'finished', 1, 1),
(10, 9, 10, 'Besoin cours de dressage pour chien', 3, 9, 10, 'waiting_for_completion', 0, 1),
(47, 10, 1, 'Donne cours de Français', 2, 8, 10, 'finished', 1, 1),
(49, 14, 10, 'Besoin cours de dressage pour chien', 3, 14, 10, 'finished', 1, 1),
(51, 14, 3, 'Donne cours de couture', 3, 9, 14, 'waiting_for_acceptance', 0, 0),
(55, 10, 34, 'Donne cours de peinture', 4, 17, 10, 'waiting_for_acceptance', 0, 0),
(57, 7, 2, 'Besoin d\'un coup de main pour du jardinage', 3, 7, 8, 'waiting_for_acceptance', 0, 0),
(58, 7, 8, 'Covoiturage Angers-Sud', 2, 10, 7, 'finished', 1, 1),
(62, 7, 8, 'Covoiturage Angers-Sud', 2, 10, 7, 'waiting_for_completion', 1, 0),
(64, 10, 37, 'Souhaite apprendre à faire des macarons', 5, 10, 18, 'finished', 1, 1),
(71, 20, 37, 'Souhaite apprendre à faire des macarons', 5, 20, 18, 'waiting_for_completion', 1, 1),
(76, 10, 36, 'Donne coup de main pour bricolage', 3, 18, 10, 'finished', 1, 1),
(125, 10, 36, 'Donne coup de main pour bricolage', 3, 18, 10, 'waiting_for_acceptance', 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `title` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `title`) VALUES
(1, 'Mobilité et transports'),
(2, 'Découverte de la ville'),
(3, 'Enseignement et apprentissage'),
(4, 'Activités de loisirs'),
(5, 'Services à domicile en intérieur'),
(6, 'Autres'),
(7, 'Services à domicile en extérieur'),
(10, 'Cuisine'),
(13, 'Sport'),
(15, 'Danse'),
(16, 'Jardinage');

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `title` varchar(80) NOT NULL,
  `content` varchar(200) NOT NULL,
  `author_id` int(11) NOT NULL,
  `status` varchar(60) DEFAULT 'waiting_for_validation',
  `activity_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `creationTimestamp` datetime NOT NULL,
  `score` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `comments`
--

INSERT INTO `comments` (`id`, `title`, `content`, `author_id`, `status`, `activity_id`, `booking_id`, `creationTimestamp`, `score`) VALUES
(2, 'Très bon momment passé avec Coralie.', 'C\'était un plaisir de te rencontrer et de t\'expliquer le réseau de transports de notre ville... qui n\'est pas toujours simple à comprendre haha! A bientôt!', 8, 'validated', 7, 3, '2023-08-10 20:03:22', 4),
(3, 'Super cours de Français.', 'J\'ai appris beaucoup de choses pendant notre dernier cours. Je sens que je progresse! Je n\'hésiterai pas à revenir vers toi en cas de besoin!', 9, 'validated', 1, 4, '2023-08-10 20:03:22', 5),
(4, 'Très belle visite du centre-ville', 'Coralie est un très bon guide. Elle connaît beaucoup d\'anecdotes. C\'était vraiment très sympa. N\'hésitez pas à réserver vous aussi!', 10, 'validated', 5, 5, '2023-08-11 14:45:02', 3),
(9, 'Très bon cours : vive la couture!', 'Avec Coralie, j\'apprends beaucoup et j\'ai l\'impression de progresser très vite. Bientôt je serai capable de faire mes propres ourlets toute seule. Merci Coralie!', 10, 'validated', 3, 6, '2023-08-11 15:05:05', 4),
(12, 'Super comme d\'habitude', 'J\'ai passé un très bon moment et j\'ai beaucoup appris!', 10, 'waiting_for_validation', 1, 47, '2023-09-12 11:07:00', 4),
(15, 'Adrian est un très bon apprenant', 'J\'ai passé un très bon moment avec Adrian qui a été très attentif pendant notre session de pâtisserie. A refaire ! :)', 10, 'waiting_for_validation', 37, 64, '2023-10-09 21:16:56', 4),
(16, 'Très bon bricoleur', 'Adrian s\'y connaît beaucoup en bricolage ! Il a réparé très rapidement mon étagère. C\'est parfait !', 10, 'waiting_for_validation', 36, 76, '2023-10-09 21:33:02', 4);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `key_id` varchar(90) NOT NULL,
  `firstName` varchar(60) NOT NULL,
  `lastName` varchar(60) NOT NULL,
  `email` varchar(90) NOT NULL,
  `password` varchar(120) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `creationTimestamp` datetime NOT NULL,
  `connexionTimestamp` datetime DEFAULT NULL,
  `points` int(11) NOT NULL,
  `role` varchar(5) NOT NULL,
  `accountIsConfirmed` varchar(5) NOT NULL,
  `avatar` varchar(180) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `key_id`, `firstName`, `lastName`, `email`, `password`, `phone`, `creationTimestamp`, `connexionTimestamp`, `points`, `role`, `accountIsConfirmed`, `avatar`) VALUES
(7, 'ZRzIdBc8z4VKXPXP4C7Muqrwyr93NK', 'admin', 'admin', 'admin@gmail.com', '$2b$10$67M9Rs9FbkYCSN2qE4UerO8T5k829.7eGQMsnGZKig253bfJfe1pm', '4381111111', '2023-08-07 18:43:35', '2024-03-25 16:50:15', 26, 'admin', 'yes', NULL),
(8, 'qNjKMLfvhQfe809UV6WF2oISJEEFnn', 'Jacques', 'Martin', 'user2-test-harmony@hotmail.fr', '$2b$10$51alFSERonEWWHK0yfGJIeeNLL/cnKAxN2OpsG2MOTAYHahQBNeY6', '4382222222', '2023-08-07 18:44:15', '2024-03-28 15:16:07', 28, 'user', 'yes', 'harmony/users/userHomme2_l7wsys'),
(9, 'KTED6wKJOXZEnYNOzNVQpRtaF6xyYW', 'Coralie', 'Cochard', 'coraliecochard-harmony@gmail.com', '$2b$10$DHmAALjlH1KcZ4syArANS./aGiBmV561.iFMw5adVCoeLecp4XJg.', '4383333333', '2023-08-08 10:31:57', '2024-01-05 19:15:30', 15, 'user', 'yes', 'harmony/users/userFemme10_rqpybw'),
(10, '4uEchwaggYgrgQ0GfxibYfVgld9x1K', 'Juliette', 'Planchain', 'user-test-harmony@hotmail.fr', '$2b$10$oAG3/Kszj92X5cVAJgo13.6k92u5w3H3BBgK4ef45Lz/4kPjcTu.a', '4384444444', '2023-08-22 10:25:04', '2024-03-28 15:12:41', 95, 'user', 'yes', 'harmony/users/juliette_hjf548'),
(13, 'qNjKMLfvhQfe809UV6WF2oISJEEFnn', 'Francisco', 'Santos', 'user3-test-harmony@hotmail.fr', '$2b$10$51alFSERonEWWHK0yfGJIeeNLL/cnKAxN2OpsG2MOTAYHahQBNeY6', '4385555555', '2023-08-29 11:26:57', '2024-03-28 15:17:25', 2, 'user', 'yes', 'harmony/users/userHomme1_l7ymoj'),
(14, 'qNjKMLfvhQfe809UV6WF2oISJEEFnn', 'Aïssatou', 'Diallo', 'user4-test-harmony@hotmail.fr', '$2b$10$51alFSERonEWWHK0yfGJIeeNLL/cnKAxN2OpsG2MOTAYHahQBNeY6', '4386666666', '2023-09-12 10:03:59', '2024-03-28 15:18:28', 2, 'user', 'yes', 'harmony/users/userFemme1_evm2zz'),
(15, 'qNjKMLfvhQfe809UV6WF2oISJEEFnn', 'Asha', 'Pandey', 'ashapandey-harmony@gmail.com', '$2b$10$51alFSERonEWWHK0yfGJIeeNLL/cnKAxN2OpsG2MOTAYHahQBNeY6', '4387777777', '2023-09-12 12:23:54', '2023-09-12 12:25:58', 5, 'user', 'yes', 'harmony/users/asha_eh4dag'),
(16, 'qNjKMLfvhQfe809UV6WF2oISJEEFnn', 'Sékou', 'Diarra', 'sekoudiarra-harmony@gmail.com', '$2b$10$51alFSERonEWWHK0yfGJIeeNLL/cnKAxN2OpsG2MOTAYHahQBNeY6', '4389999999', '2023-09-12 14:55:11', '2023-09-12 14:55:33', 5, 'user', 'yes', 'harmony/users/sekou_up9jx4'),
(17, 'qNjKMLfvhQfe809UV6WF2oISJEEFnn', 'Julia', 'Santos', 'juliasantos-harmony@gmail.com', '$2b$10$51alFSERonEWWHK0yfGJIeeNLL/cnKAxN2OpsG2MOTAYHahQBNeY6', '4380000000', '2023-09-12 15:12:56', '2024-03-28 15:21:41', 5, 'user', 'yes', 'harmony/users/julia_hzruma'),
(18, 'qNjKMLfvhQfe809UV6WF2oISJEEFnn', 'Adrian', 'Kumara', 'adriankumara-harmony@gmail.com', '$2b$10$51alFSERonEWWHK0yfGJIeeNLL/cnKAxN2OpsG2MOTAYHahQBNeY6', '4381111112', '2023-09-12 15:35:50', '2024-01-02 22:17:59', 5, 'user', 'yes', 'harmony/users/adrian_wznsu5'),
(30, 'M6dQGwiaJeyoal3I0H9cr0pvpI3hoy', 'Compte Admin', 'Compte Admin', 'admin-harmony@gmail.com', '$2b$10$jBYHPgU9bd7TiAlfMYwao.jNZWIo5Sxth1oPiB2v36s8oEXshsZpu', '4381111113', '2023-10-31 14:34:46', '2024-03-28 15:11:49', 5, 'admin', 'yes', NULL),
(47, '4MQGbNVzUpT7suzZJ8GVArJtQvLpzK', 'Georges', 'Pommier', 'georgespommier-harmony@gmail.com', '$2b$10$LJ2Hh02DcrS5zpPIYVrtb.ni5ge/Igv1A7oqPaKhu4yah93spBuUK', '4381111114', '2023-11-23 12:46:18', '2024-01-02 22:04:06', 5, 'user', 'yes', NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT pour la table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
