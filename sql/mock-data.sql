-- First User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'First',
  'first@mail.com',
  '$2b$08$ZC1.w.baYLtj9CJY6/3xA.IZOs11XLcbFnZxNH4IgnErYqHAQ/fiy',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (1, 'Reader');
INSERT INTO users_roles VALUES (1, 'Admin');
INSERT INTO users_roles VALUES (1, 'Author');

-- Second User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'Second',
  'second@mail.com',
  '$2b$08$7x1qq.TDjqeJ1obNXVZYQOqUuspbZCYioUqwbecSWKQNwcfMRUQ72',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (2, 'Reader');
INSERT INTO users_roles VALUES (2, 'Author');

-- Third User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'Third',
  'third@mail.com',
  '$2b$08$Zkt5.wzypwWE.R8lt6g7gepJn6GzHGTaUEi0V8aoJKqYkFSvXwqJy',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (3, 'Reader');
INSERT INTO users_roles VALUES (3, 'Author');

-- Fourth User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'Fourth',
  'fourth@mail.com',
  '$2b$08$yJJx9iFouerDbb0hXRUgaeeg/uTr2uzoygGPneLf2Xq2ow8IHzROq',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (4, 'Reader');
INSERT INTO users_roles VALUES (4, 'Author');

-- Fifth User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'Fifth',
  'fifth@mail.com',
  '$2b$08$Qg1foRW23Z7GpJz0GpRLY.pNQ.94OMBr5nYW.enti0ppvfXFCJhfa',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (5, 'Reader');
INSERT INTO users_roles VALUES (5, 'Author');

-- Sixth User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'Sixth',
  'sixth@mail.com',
  '$2b$08$J.NLZs98LJZE38ZZsddWb.VKKEymeZOUhnPOxoWbmiHv1zVbl3tmW',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (6, 'Reader');
INSERT INTO users_roles VALUES (6, 'Author');

-- Seventh User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'Seventh',
  'seventh@mail.com',
  '$2b$08$omEWkClA3dWNt32Nq/3r2.bJ1V.vpSlE0sDzJGUAUofbf3peBQhJW',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (7, 'Reader');
INSERT INTO users_roles VALUES (7, 'Author');

-- Eighth User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'Eighth',
  'eighth@mail.com',
  '$2b$08$1ROvoa4ZCvnCVdnV/BH9yOyghvvl4GcKQ/Q8aTLTdmTJJlipMedAm',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (8, 'Reader');
INSERT INTO users_roles VALUES (8, 'Author');

-- Ninth User
INSERT INTO users (
  username,
  email,
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  'Ninth',
  'ninth@mail.com',
  '$2b$08$qtyZyFhWEeAK4hP8cMi4Qe2bj4m7cAyd2hvsS.qWhn2e1FVMQaHPG',
  NOW(),
  NOW()
);

INSERT INTO users_roles VALUES (9, 'Reader');
INSERT INTO users_roles VALUES (9, 'Author');

-- First Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'First',
  1,
  NOW(),
  NOW()
);

-- Second Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'Second',
  1,
  NOW(),
  NOW()
);

-- Third Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'Third',
  1,
  NOW(),
  NOW()
);

-- Fourth Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'Fourth',
  1,
  NOW(),
  NOW()
);

-- Fifth Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'Fifth',
  1,
  NOW(),
  NOW()
);

-- Sixth Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'Sixth',
  1,
  NOW(),
  NOW()
);

-- Seventh Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'Seventh',
  1,
  NOW(),
  NOW()
);

-- Eighth Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'Eighth',
  1,
  NOW(),
  NOW()
);

-- Ninth Book
INSERT INTO books (
  name,
  "authorId",
  "createdAt",
  "updatedAt"
) VALUES (
  'Ninth',
  1,
  NOW(),
  NOW()
);

-- First Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  1,
  1,
  FLOOR(random() * 5) + 1,
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  NOW(),
  NOW()
);

-- Second Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  2,
  1,
  FLOOR(random() * 5) + 1,
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  NOW(),
  NOW()
);

-- Third Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  3,
  1,
  FLOOR(random() * 5) + 1,
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  NOW(),
  NOW()
);

-- Fourth Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  4,
  1,
  FLOOR(random() * 5) + 1,
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  NOW(),
  NOW()
);

-- Fifth Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  5,
  1,
  FLOOR(random() * 5) + 1,
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  NOW(),
  NOW()
);

-- Sixth Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  6,
  1,
  FLOOR(random() * 5) + 1,
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  NOW(),
  NOW()
);

-- Seventh Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  7,
  1,
  FLOOR(random() * 5) + 1,
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  NOW(),
  NOW()
);

-- Eighth Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  8,
  1,
  FLOOR(random() * 5) + 1,
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  NOW(),
  NOW()
);

-- Ninth Review
INSERT INTO reviews (
  "userId",
  "bookId",
  rate,
  text,
  "createdAt",
  "updatedAt"
) VALUES (
  9,
  1,
  FLOOR(random() * 5) + 1,
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  NOW(),
  NOW()
);
