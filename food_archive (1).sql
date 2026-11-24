-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 24, 2026 at 02:36 PM
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
(25, 9, 'ssysr', NULL, '2026-11-23 06:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `collection_recipes`
--

CREATE TABLE `collection_recipes` (
  `id` int(11) NOT NULL,
  `collection_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(7, 14, 8, 'just kidding', '2026-11-23 07:52:22', '2026-11-23 07:52:31'),
(8, 14, 8, 'si raphael', '2026-11-23 07:52:42', '2026-11-23 07:52:53');

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
(3, 9, 12, '2026-11-23 06:12:45'),
(4, 8, 7, '2026-11-23 07:51:48'),
(7, 8, 9, '2026-11-23 07:51:53'),
(8, 8, 10, '2026-11-23 07:51:55'),
(9, 8, 17, '2026-11-23 07:52:00'),
(10, 10, 17, '2026-11-23 07:55:02'),
(11, 10, 14, '2026-11-23 07:55:03'),
(12, 10, 15, '2026-11-23 07:55:04'),
(13, 10, 9, '2026-11-23 07:55:05'),
(14, 10, 10, '2026-11-23 07:55:06'),
(15, 10, 11, '2026-11-23 07:55:07');

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
(2, 1, 12, 5, NULL, '2026-11-23 06:06:35', '2026-11-23 06:06:35'),
(3, 8, 14, 5, NULL, '2026-11-23 07:52:12', '2026-11-23 07:53:10'),
(6, 8, 11, 4, NULL, '2026-11-23 07:53:25', '2026-11-23 07:54:20'),
(7, 8, 17, 4, NULL, '2026-11-23 07:53:37', '2026-11-23 07:53:37'),
(8, 8, 16, 5, NULL, '2026-11-23 07:53:42', '2026-11-23 07:53:42'),
(9, 8, 15, 2, NULL, '2026-11-23 07:53:46', '2026-11-23 07:53:46'),
(10, 8, 13, 5, NULL, '2026-11-23 07:53:55', '2026-11-23 07:53:55'),
(11, 8, 12, 3, NULL, '2026-11-23 07:53:59', '2026-11-23 07:53:59'),
(12, 8, 7, 4, NULL, '2026-11-23 07:54:03', '2026-11-23 07:54:03'),
(13, 8, 8, 5, NULL, '2026-11-23 07:54:07', '2026-11-23 07:54:07'),
(14, 8, 9, 4, NULL, '2026-11-23 07:54:11', '2026-11-23 07:54:11'),
(15, 8, 10, 4, NULL, '2026-11-23 07:54:15', '2026-11-23 07:54:15'),
(17, 10, 17, 4, NULL, '2026-11-23 07:55:10', '2026-11-23 07:55:10'),
(18, 10, 16, 5, NULL, '2026-11-23 07:55:15', '2026-11-23 07:55:15'),
(19, 10, 15, 4, NULL, '2026-11-23 07:55:19', '2026-11-23 07:55:19'),
(20, 10, 14, 5, NULL, '2026-11-23 07:55:24', '2026-11-23 07:55:24'),
(21, 10, 13, 5, NULL, '2026-11-23 07:55:27', '2026-11-23 07:55:27'),
(22, 10, 12, 4, NULL, '2026-11-23 07:55:31', '2026-11-23 07:55:31'),
(23, 10, 11, 5, NULL, '2026-11-23 07:55:35', '2026-11-23 07:55:35'),
(24, 10, 10, 3, NULL, '2026-11-23 07:55:40', '2026-11-23 07:55:40'),
(26, 10, 8, 4, NULL, '2026-11-23 07:55:46', '2026-11-23 07:55:46'),
(27, 10, 7, 5, NULL, '2026-11-23 07:55:50', '2026-11-23 07:55:50'),
(28, 11, 14, 4, NULL, '2026-11-23 08:12:07', '2026-11-23 08:12:07');

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
(7, 'Adobo', 'Chicken', 'Filipino Chicken Adobo', '[\"Chicken\", \"Soy Sauce\", \"White Vinegar\", \"Garlic\", \"Dry bay leaves\", \"Whole black peppercorns\", \"Sugar\", \"Water\", \"Coocking Oil\"]', '[\"Marinate the Chicken\", \"Pan Fry the Chicken\", \"Simmer\", \"Add Vinegar and Finish\"]', 'http://localhost:8000/api/uploads/1bf300d2da0342c89379c852b595afd9.jpg', 30, 1, '2026-11-23 04:41:03', '2026-11-23 04:41:03'),
(8, 'Filipino Sinigang', 'Pork', 'A tangle, tamarind-based sour soup with meats and vegetables', '[\"Pork belly\", \"Water spinach\", \"String beans\", \"Eggplant\", \"Daikon radish (labanos)\", \"Okra\", \"Tomatoes\", \"Long green pepper (siling pansigang)\", \"Onion\", \"Fish sauce\"]', '[\"Extract The Flavors From The Tamarind\", \"Boil The Tamarind Broth And Cook The Meat\", \"Add The Vegetables Sequentially\", \"Season It And Then Add The Remaining Ingredients\", \"ENJOYYY!!!\"]', 'http://localhost:8000/api/uploads/d108bc3e51774fca95c8c6f28bbce879.jpg', 25, 1, '2026-11-23 05:15:20', '2026-11-23 05:15:20'),
(9, 'Lechon kawali', 'Pork', 'Lechon kawali is a Filipino dish of deep fried pork belly with crackling crispy skin.', '[\"Pork belly\", \"Salt\", \"Whole peppercorns\", \"Dry bay leaves\", \"Cooking oil\"]', '[\"Boil the Pork Belly\", \"Dry and Season the Pork\", \"Deep Fry Until Crispy\", \"Rest and Serve\", \"ENJOYYYY!!!\"]', 'http://localhost:8000/api/uploads/06825fca6a044d059e3dd53a3e68de72.jpg', 90, 1, '2026-11-23 05:20:47', '2026-11-23 05:20:47'),
(10, 'Filipino Kare Kare', 'Pork', 'A traditional Filipino stew made with tender meat and vegetables in a thick, savory peanut sauce.', '[\"Meat\", \"Sauce Base: Ground roasted peanuts or peanut butter, thickened with toasted ground rice (or rice flour) and colored orange with annatto (achuete).\", \"Vegetables: Eggplant, string beans (sitaw), banana blossom (puso ng saging), and pechay (bok choy)\", \"Accompaniment: Bagoong alamang (often saut\\u00e9ed or spiced), which adds the salty umami punch that balances the mild, nutty sauce.\"]', '[\"immer the meat: Boil or braise oxtail and other cuts with aromatics until tender and the broth becomes rich.\", \"Build the sauce: Saut\\u00e9 garlic and onions in annatto-infused oil or with annatto water, then whisk in the meat broth, peanut butter or ground peanuts, and toasted ground rice.\", \"Combine and cook vegetables: Simmer the meat in the sauce until thickened, then add or blanch the vegetables so they stay vibrant and tender-crisp.\", \"Serve: Spoon over steamed rice and pass bagoong at the table.\"]', 'http://localhost:8000/api/uploads/52cc6463cc124640b30efe7479d5ae9e.jpg', 0, 1, '2026-11-23 05:26:08', '2026-11-23 05:26:08'),
(11, 'Filipino Sisig', 'Pork', 'A savory, tangy, and spicy Kapampangan dish from Pampanga, Philippines', '[\"1 lb pig ears\", \"1 lb pig snout\", \"1 lb pork belly\", \"2 pieces onions minced\", \"3 pieces bay leaves\", \"2 teaspoons salt\", \"4 thumbs ginger crushed\", \"1 quarts water\"]', '[\"Combine pig ears, snout, pork belly, ginger, bay leaves, 2 teaspoons salt, and 1 quart of water in a cooking pot. Boil for 1 hour. Remove from the pot and drain the water.\", \"Heat-up your grill. Start grilling the pig parts for around 5 minutes per side. Remove from the grill afterwards and let it cool down.\", \"Make the dressing by combining all the dressing ingredients. Mix well.\", \"Chop the grilled pig parts into small pieces. In a large mixing bowl, combine the chopped pork with onion and the dressing mixture. Toss until all the ingredients are well blended.\", \"Transfer to a serving plate. Serve with your favorite drink. Share and enjoy!\"]', 'http://localhost:8000/api/uploads/752b7a262e2341429c2256df2cff1d00.jpg', 15, 1, '2026-11-23 05:40:00', '2026-11-23 05:40:00'),
(12, 'Chicken Inasal', 'Chicken', 'A tangy, citrusy, and smoky Filipino chargrilled chicken dish originating from the Visayas region', '[\"Chicken: 1 kg (about 2 lbs)\", \"Calamansi juice: \\u00bd cup (about 12\\u201315 pieces, strained of seeds)\", \"Vinegar: \\u00bd cup coconut vinegar (sukang tuba) or cane vinegar.\", \"Lemon-lime soda: \\u00bd to 1 cup (Sprite or 7-Up) for tenderness and light sweetness.\", \"Lemongrass (tanglad): 2\\u20133 stalks, white bottom parts bruised and finely minced\", \"Garlic: 1 whole head (about 6\\u20138 cloves)\", \"Ginger: 2 thumbs (about 2 tablespoons)\", \"Brown sugar: 2 to 4 tablespoons\", \"Seasoning: 1\\u00bd teaspoons salt and \\u00bd to 1 teaspoon freshly ground black pepper.\"]', '[\"Marinate the Chicken\", \"Make the Annatto Chicken Oil\", \"Grill the Chicken\", \"Rest and Serve\"]', 'http://localhost:8000/api/uploads/d6b706bce22f4c6b8daef206088dc63e.jpg', 15, 1, '2026-11-23 05:49:42', '2026-11-23 05:49:42'),
(13, 'Beef kaldereta', 'Beef', 'Beef Kaldereta is a rich, savory, and slightly spicy Filipino beef stew traditionally simmered in tomato sauce and thickened with liver spread', '[\"Protein: 1 kg beef chuck, short ribs, or brisket (cut into cubes)\", \"Base & Aromatics: Cooking oil, garlic, onions, bay leaves, and beef broth or water\", \"Tomato & Richness: Tomato sauce, tomato paste, and a small can (about 60g) of liver spread (or creamy peanut butter as a regional alternative)\", \"Vegetables: Potatoes, carrots, red and green bell peppers, green olives, and green peas\", \"Flavor Enhancers: Soy sauce, fish sauce (patis), a bit of sugar, salt, black pepper, chili flakes or bird\'s eye chilies for heat, and grated quick-melt cheese on top\"]', '[\"1. Sear the Beef: Heat oil in a large pot or Dutch oven, and brown the beef pieces on all sides\", \"2. Saut\\u00e9 Aromatics: Add the minced garlic and chopped onions until soft and fragrant\", \"3. Simmer the Meat: Stir in the tomato paste, tomato sauce, bay leaves, and enough water or beef stock to cover the meat. Cover and simmer on low heat (or use a pressure cooker) until the beef becomes tender\\u2014about 1 to 2 hours for traditional stovetop cooking.\", \"4. Add Veggies & Liver Spread: Stir in the liver spread, potatoes, and carrots. Cook until the vegetables are nearly tender, then add the bell peppers, green olives, and green peas.\", \"5. Season and Finish: Adjust with salt, pepper, sugar, and chili to taste. Stir in grated cheese right before serving hot with steamed white rice.\"]', 'http://localhost:8000/api/uploads/48fd583d45f04574be6261a574c25bf8.jpg', 25, 1, '2026-11-23 06:46:18', '2026-11-23 06:46:18'),
(14, 'Pancit bihon', 'Pasta', 'Filipino pancit is a savory stir-fried noodle dish traditionally made with soaked rice noodles (bihon), chewy egg noodles (canton), pork, and crisp vegetables tossed in a soy-oyster sauce.', '[\"Noodles: 2 oz. pancit canton and 2 oz. pancit bihon\", \"Proteins: 4 oz. sliced pork shoulder, 4 oz. shredded boiled chicken breast, and 8-10 peeled medium shrimp\", \"Vegetables & Aromatics: 2 cups chopped cabbage, 1 julienned carrot, 1\\u00bd cups sliced green beans, \\u00bd cup chopped parsley, 1 sliced onion, and 3 crushed garlic cloves\", \"Seasoning & Broth: 4 tbsp soy sauce, 4 tbsp cooking oil, 1 Knorr Shrimp Cube, \\u00bc tsp black pepper, and 2\\u20133 cups water\"]', '[\"Prep noodles and shrimp: Soak the bihon noodles in water for 10 minutes, then drain. Pan-fry the shrimp in 3 tbsp of cooking oil for 1 minute per side, then set aside.\", \"Saut\\u00e9 aromatics and meat: Saut\\u00e9 the onion and garlic in the same pot, add the pork until light brown, then add the shredded chicken and cook for 3 minutes.\", \"Simmer the broth: Add the soy sauce, water, and Knorr Shrimp Cube. Cover and simmer over low heat for 20 minutes until the pork softens.\", \"Cook vegetables: Add the carrots, green beans, and cabbage, covering to cook for 2 minutes.\", \"Add noodles and combine: Layer the pancit canton on top to steam for 3 minutes, then gently fold in the soaked bihon, shrimp, and black pepper until the liquid is fully absorbed.\", \"Serve: Transfer to a platter and serve hot\"]', 'http://localhost:8000/api/uploads/7466e2313dae4fee934f8ebbab1f4c0e.jpg', 23, 1, '2026-11-23 06:50:11', '2026-11-23 07:51:28'),
(15, 'Fried chicken', 'Chicken', 'Fried chicken by panlasang pinoy', '[\"1 \\u00bd lbs. chicken drumsticks (with slits sliced to the bone)\", \"16 ml Knorr SavorRich Chicken Liquid Seasoning\", \"5 tablespoons soy sauce\", \"2 pieces calamansi\", \"1/8 teaspoon ground black pepper\", \"\\u00bd cup all-purpose flour (optional cornstarch for extra crisp)\", \"2 cups cooking oil (for deep frying)\"]', '[\"Score the chicken. Make deep slits on the chicken drumsticks, slicing all the way to the bone so the marinade penetrates quickly and the meat cooks evenly.\", \"Marinate for 10 minutes. Place the chicken inside a resealable bag with the soy sauce, calamansi juice, Knorr SavorRich Chicken Liquid Seasoning, and ground black pepper. Seal the bag with some air trapped inside, shake well to blend the ingredients, then press the air out and reseal.\", \"Heat the oil. Pour 2 cups of cooking oil into a deep pot and heat it to 360\\u00b0F (about 182\\u00b0C)\", \"Coat with flour. Put the all-purpose flour (and optional cornstarch for extra crunch) into a covered container. Add one or two marinated drumsticks at a time, cover, and shake until completely coated, then shake off any excess flour.\", \"Deep-fry. Carefully place the coated chicken into the hot oil and deep-fry for 14 minutes until golden brown and cooked through.\", \"Rest and serve. Remove the chicken from the pot and let it rest on a wire rack or paper towels for 5 minutes before serving with steamed rice and banana ketchup.\"]', 'http://localhost:8000/api/uploads/426c72e4aff245449b13e48ecd6ea55c.jpg', 15, 1, '2026-11-23 06:58:03', '2026-11-23 06:58:03'),
(16, 'Filipino Spaghetti', 'Pasta', 'A sweet-savory Filipino adaptation of meat-sauce spaghetti, typically made with a sweetened tomato sauce, sliced hot dogs, ground meat, and grated cheese.', '[\"2 lbs. Spaghetti noodles\", \"1 lb. ground pork\", \"6 ounces luncheon meat minced\", \"4 pieces hotdogs or beef franks\", \"35 ounces Filipino Style Spaghetti Sauce\", \"1/2 cup shredded cheddar cheese\", \"1 cup beef broth\", \"1 medium onion minced\", \"1 teaspoon minced garlic\", \"Salt and pepper to taste\", \"3 tablespoons cooking oil\"]', '[\"Cook the Spaghetti noodles according to package instructions. Once cooked, transfer to a bowl. Set aside.\", \"Heat the oil in a Pan.\", \"Saute the onion and garlic.\", \"Once the onions becomes soft, add the ground pork. Cook until the color turns light brown.\", \"Add the luncheon meat and hot\", \"Pour-in the Spaghetti sauce and beef broth. Stir and let boil. Cover and simmer for 30 minutes.\", \"Try to taste the sauce and add salt and pepper if needed.\", \"Pour the Filipino Style Spaghetti sauce over the Spaghetti. Top with shredded cheese.\", \"Serve. Share and enjoy!\"]', 'http://localhost:8000/api/uploads/bf80a73adf8d4c06a7c7beb2b6ad6a07.jpg', 25, 1, '2026-11-23 07:44:00', '2026-11-23 07:44:00'),
(17, 'Filipino Halo-Halo', 'Dessert', 'A Cold, layered Filipino shaved-ice dessert.', '[\"1 to 1\\u00bd cups finely shaved ice, \\u00bc to \\u00bd cup evaporated milk, and optional sweetened condensed milk or sugar to taste.\", \"Bottom Mix-Ins (1\\u20132 tbsp each): Sweetened saba bananas (minatamis na saging), sweetened red mung beans or garbanzos, sweetened jackfruit (langka), macapuno (sweetened coconut strips), nata de coco (coconut gel), kaong (sugar palm fruit), and cooked sago/tapioca pearls or gulaman jelly.\", \"Toppings: 1 slice leche flan, 1 scoop ube ice cream, 1 to 2 tbsp ube halaya (purple yam jam), and pinipig (toasted glutinous rice flakes) or cornflakes for crunch.\"]', '[\"Layer the base mix-ins: Spoon small amounts of your chosen beans, sweetened fruits, jellies, and ube halaya into the bottom of a tall glass.\", \"Add shaved ice: Pack fine, fluffy shaved ice over the layered ingredients so there is room at the top for milk and toppings. (If you do not have an ice shaver, blend ice finely or freeze a milk-water mix to shave/crush.)\", \"Pour the milk: Drizzle evaporated milk (and condensed milk, if desired) over the shaved ice.\", \"Add toppings: Crown with a slice of leche flan, a scoop of ube ice cream, and pinipig or cereal.\", \"Mix and serve: Serve immediately with a long spoon and stir thoroughly before eating.\"]', 'http://localhost:8000/api/uploads/aa215a732769448d97a76168accd69a4.jpg', 9, 1, '2026-11-23 07:49:30', '2026-11-23 07:49:30');

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
(4, 'noel', 'noelcas', '147258369', 'user', '2026-11-19 13:55:47'),
(5, 'asdf', 'gome', 'gome123456', 'user', '2026-11-22 17:36:26'),
(6, 'john', 'jon', '12345678', 'user', '2026-11-23 03:47:51'),
(7, 'noel casulla', 'casullanoel343@gmail.com', 'casullanoel', 'admin', '2026-11-23 04:30:53'),
(8, 'noelcasulla', 'noelcasulla@gmail.com', 'noelcasulla', 'user', '2026-11-23 05:52:28'),
(9, 'rap', 'rap', '147258369', 'user', '2026-11-23 06:11:56'),
(10, 'RENZ BENEDICT ERMOSO GOMEZ', 'grenzbenedict@gmail.com', 'panotako', 'user', '2026-11-23 07:54:54'),
(11, 'rengomez', 'rengomez', '147258369', 'user', '2026-11-23 08:11:08'),
(13, 'dfalr', 'asdf', '12345678', 'user', '2026-11-23 15:11:08');

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
('154f7be640de419a8d6829a7e062184d', 1, '2026-11-23 16:00:36'),
('1cd49af2c469441ebb10cd00e78e90db', 6, '2026-11-23 15:50:57'),
('2c2c9ad14d904fe087970fd1c3917308', 1, '2026-11-24 02:20:58'),
('4e046a29fc1049a6b9a28ec0d4416d01', 13, '2026-11-24 03:11:19'),
('6b5b2d0f1c2a4d5caea857a2a79af3f5', 6, '2026-11-23 15:48:30'),
('6f9179110dbd4202a1f3f163a61e1fc6', 7, '2026-11-23 16:53:36'),
('98bf3f19720f43a19a84aa184197a96f', 1, '2026-11-24 02:37:33'),
('b99adfa4009a40f4babf335e0020bd9b', 1, '2026-11-23 15:51:35'),
('c75089c3057e4982ba4b06b861395500', 1, '2026-11-24 02:21:14'),
('daf36900815041aeac947d37b04861ae', 1, '2026-11-23 18:41:33'),
('f95bb8c98ec9423e8f86b0a60a699025', 6, '2026-11-23 15:49:57');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `collection_recipes`
--
ALTER TABLE `collection_recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `recipes`
--
ALTER TABLE `recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
