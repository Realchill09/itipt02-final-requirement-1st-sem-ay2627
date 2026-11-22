-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2026 at 03:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `food_archive`
--

-- --------------------------------------------------------

--
-- Table structure for table `collections`
--

CREATE TABLE `collections` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `collections`
--

INSERT INTO `collections` (`id`, `user_id`, `name`, `description`, `created_at`) VALUES
(1, 1, 'foods', NULL, '2026-11-18 02:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `collection_recipes`
--

CREATE TABLE `collection_recipes` (
  `id` int(11) NOT NULL,
  `collection_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `collection_recipes`
--

INSERT INTO `collection_recipes` (`id`, `collection_id`, `recipe_id`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `recipe_id`, `user_id`, `message`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'delecios', '2026-11-18 02:00:07', '2026-11-18 02:00:07'),
(2, 1, 3, 'ladfldflj', '2026-11-18 02:01:51', '2026-11-18 02:01:51');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `recipe_id`, `created_at`) VALUES
(1, 1, 1, '2026-11-18 02:28:52'),
(2, 4, 1, '2026-11-19 13:56:22');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `review` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `recipe_id`, `rating`, `review`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 5, NULL, '2026-11-18 01:59:56', '2026-11-18 01:59:56');

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ingredients` longtext NOT NULL,
  `steps` longtext NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `cooking_time` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recipes`
--

INSERT INTO `recipes` (`id`, `name`, `category`, `description`, `ingredients`, `steps`, `image`, `cooking_time`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'fried chicken', 'Chicken', 'Fried chicken by panlasang pinoy', '[\"1 \\u00bd lbs. chicken drumsticks (with slits sliced to the bone)\", \"16 ml Knorr SavorRich Chicken Liquid Seasoning\", \"5 tablespoons soy sauce\", \"2 pieces calamansi\", \"1/8 teaspoon ground black pepper\", \"\\u00bd cup all-purpose flour (optional cornstarch for extra crisp)\", \"2 cups cooking oil (for deep frying)\"]', '[\"\\u2022 Score the chicken. Make deep slits on the chicken drumsticks, slicing all the way to the bone so the marinade penetrates quickly and the meat cooks evenly.\", \"\\u2022 Marinate for 10 minutes. Place the chicken inside a resealable bag with the soy sauce, calamansi juice, Knorr SavorRich Chicken Liquid Seasoning, and ground black pepper. Seal the bag with some air trapped inside, shake well to blend the ingredients, then press the air out and reseal.\", \"Heat the oil. Pour 2 cups of cooking oil into a deep pot and heat it to 360\\u00b0F (about 182\\u00b0C).\", \"\\u2022 Coat with flour. Put the all-purpose flour (and optional cornstarch for extra crunch) into a covered container. Add one or two marinated drumsticks at a time, cover, and shake until completely coated, then shake off any excess flour.\", \"Deep-fry. Carefully place the coated chicken into the hot oil and deep-fry for 14 minutes until golden brown and cooked through.\", \"Rest and serve. Remove the chicken from the pot and let it rest on a wire rack or paper towels for 5 minutes before serving with steamed rice and banana ketchup.\"]', 'http://localhost:8000/api/uploads/28a372910ca4457e9fe405760df08bed.jpeg', 30, 1, '2026-11-18 01:46:18', '2026-11-18 03:38:12'),
(2, 'Pancit bihon', 'Pasta', 'Filipino pancit is a savory stir-fried noodle dish traditionally made with soaked rice noodles (bihon), chewy egg noodles (canton), pork, and crisp vegetables tossed in a soy-oyster sauce. You can explore the top-rated recipes from the web below, or follow the classic mixed-noodle recipe from Panlasang Pinoy right underneath.', '[\"Noodles: 2 oz. pancit canton and 2 oz. pancit bihon\", \"Proteins: 4 oz. sliced pork shoulder, 4 oz. shredded boiled chicken breast, and 8-10 peeled medium shrimp\", \"Vegetables & Aromatics: 2 cups chopped cabbage, 1 julienned carrot, 1\\u00bd cups sliced green beans, \\u00bd cup chopped parsley, 1 sliced onion, and 3 crushed garlic cloves\", \"Seasoning & Broth: 4 tbsp soy sauce, 4 tbsp cooking oil, 1 Knorr Shrimp Cube, \\u00bc tsp black pepper, and 2\\u20133 cups water\"]', '[\"Prep noodles and shrimp: Soak the bihon noodles in water for 10 minutes, then drain. Pan-fry the shrimp in 3 tbsp of cooking oil for 1 minute per side, then set aside.\", \"Saut\\u00e9 aromatics and meat: Saut\\u00e9 the onion and garlic in the same pot, add the pork until light brown, then add the shredded chicken and cook for 3 minutes.\", \"3. Simmer the broth: Add the soy sauce, water, and Knorr Shrimp Cube. Cover and simmer over low heat for 20 minutes until the pork softens.\", \"Cook vegetables: Add the carrots, green beans, and cabbage, covering to cook for 2 minutes.\", \"Add noodles and combine: Layer the pancit canton on top to steam for 3 minutes, then gently fold in the soaked bihon, shrimp, and black pepper until the liquid is fully absorbed.\", \"Serve: Transfer to a platter and serve hot\"]', 'http://localhost:8000/api/uploads/7ce5ea45ea4c4e72a38b3d9f6f40c814.jpg', 80, 1, '2026-11-18 02:41:22', '2026-11-18 02:41:22'),
(4, 'Beef kaldereta', 'Beef', 'Beef Kaldereta is a rich, savory, and slightly spicy Filipino beef stew traditionally simmered in tomato sauce and thickened with liver spread', '[\"Protein: 1 kg beef chuck, short ribs, or brisket (cut into cubes)\", \"Base & Aromatics: Cooking oil, garlic, onions, bay leaves, and beef broth or water\", \"Tomato & Richness: Tomato sauce, tomato paste, and a small can (about 60g) of liver spread (or creamy peanut butter as a regional alternative)\", \"Vegetables: Potatoes, carrots, red and green bell peppers, green olives, and green peas\", \"Flavor Enhancers: Soy sauce, fish sauce (patis), a bit of sugar, salt, black pepper, chili flakes or bird\'s eye chilies for heat, and grated quick-melt cheese on top\"]', '[\"Sear the Beef: Heat oil in a large pot or Dutch oven, and brown the beef pieces on all sides\", \"Saut\\u00e9 Aromatics: Add the minced garlic and chopped onions until soft and fragrant\", \"Simmer the Meat: Stir in the tomato paste, tomato sauce, bay leaves, and enough water or beef stock to cover the meat. Cover and simmer on low heat (or use a pressure cooker) until the beef becomes tender\\u2014about 1 to 2 hours for traditional stovetop cooking.\", \"Add Veggies & Liver Spread: Stir in the liver spread, potatoes, and carrots. Cook until the vegetables are nearly tender, then add the bell peppers, green olives, and green peas.\", \"Season and Finish: Adjust with salt, pepper, sugar, and chili to taste. Stir in grated cheese right before serving hot with steamed white rice.\"]', 'http://localhost:8000/api/uploads/1923a8484449490da222e314ecdbfff9.jpg', 30, 1, '2026-11-19 08:28:47', '2026-11-19 08:28:47');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'renz', 'renz@gmail.com', '12345678', 'admin', '2026-11-17 04:39:52'),
(2, 'benedict', 'benedict@gmail.com', '12345678', 'user', '2026-11-18 01:59:16'),
(3, 'ben', 'ben', '12345678', 'user', '2026-11-18 02:01:22'),
(4, 'noel', 'noelcas', '147258369', 'user', '2026-11-19 13:55:47');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `session_id` varchar(128) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`session_id`, `user_id`, `expires_at`) VALUES
('94aed778d8284fe498b54383d7fcc60c', 1, '2026-11-21 05:10:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `collections`
--
ALTER TABLE `collections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `collection_recipes`
--
ALTER TABLE `collection_recipes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_collection_recipe` (`collection_id`,`recipe_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recipe_id` (`recipe_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`recipe_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rating` (`user_id`,`recipe_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `expires_at` (`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `collections`
--
ALTER TABLE `collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `collection_recipes`
--
ALTER TABLE `collection_recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `recipes`
--
ALTER TABLE `recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `collections`
--
ALTER TABLE `collections`
  ADD CONSTRAINT `collections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `collection_recipes`
--
ALTER TABLE `collection_recipes`
  ADD CONSTRAINT `collection_recipes_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `collection_recipes_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recipes`
--
ALTER TABLE `recipes`
  ADD CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
