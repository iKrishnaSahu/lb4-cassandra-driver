#!/bin/bash

# Script to add 50 fictional movie characters to the database

BASE_URL="http://localhost:3000/users"

# Array of movie characters with name, email, and age
declare -a characters=(
  "Luke Skywalker|luke@jedi.sw|23"
  "Darth Vader|vader@empire.sw|45"
  "Princess Leia|leia@rebellion.sw|19"
  "Han Solo|han@falcon.sw|32"
  "Yoda|yoda@jedi.sw|900"
  "Tony Stark|tony@stark.tech|42"
  "Bruce Wayne|bruce@wayne.com|35"
  "Peter Parker|peter@dailybugle.com|17"
  "Diana Prince|diana@themyscira.com|5000"
  "Hermione Granger|hermione@hogwarts.edu|18"
  "Harry Potter|harry@hogwarts.edu|17"
  "Ron Weasley|ron@hogwarts.edu|17"
  "Katniss Everdeen|katniss@district12.pan|16"
  "Peeta Mellark|peeta@district12.pan|16"
  "Tris Prior|tris@dauntless.fac|16"
  "Neo Anderson|neo@matrix.net|30"
  "Morpheus|morpheus@matrix.net|45"
  "Trinity|trinity@matrix.net|28"
  "Ellen Ripley|ripley@nostromo.space|35"
  "Sarah Connor|sarah@resistance.term|29"
  "Marty McFly|marty@hillvalley.com|17"
  "Doc Brown|doc@delorean.com|65"
  "Indiana Jones|indy@archaeology.edu|40"
  "James Bond|bond@mi6.gov.uk|38"
  "Ethan Hunt|ethan@imf.gov|35"
  "Jack Sparrow|jack@blackpearl.sea|40"
  "Elizabeth Swann|elizabeth@portroyal.sea|20"
  "Maximus Decimus|maximus@rome.empire|45"
  "William Wallace|william@scotland.free|35"
  "Leonidas|leonidas@sparta.gr|40"
  "Rey Skywalker|rey@jedi.sw|19"
  "Finn|finn@resistance.sw|23"
  "Black Widow|natasha@avengers.team|35"
  "Thor Odinson|thor@asgard.realm|1500"
  "Hulk|bruce.banner@avengers.team|42"
  "Wolverine|logan@xmen.team|200"
  "Professor X|charles@xmen.team|60"
  "Mystique|raven@xmen.team|100"
  "Eleven|eleven@hawkins.in|14"
  "Mulan|mulan@china.dynasty|16"
  "Simba|simba@pridelands.africa|3"
  "Elsa|elsa@arendelle.frozen|21"
  "Moana|moana@motunui.ocean|16"
  "Shrek|shrek@swamp.far|35"
  "Donkey|donkey@swamp.far|10"
  "Woody|woody@andysroom.toy|30"
  "Buzz Lightyear|buzz@starcommand.toy|25"
  "Nemo|nemo@reef.ocean|1"
  "Dory|dory@ocean.fish|5"
  "Forrest Gump|forrest@greenbow.al|40"
)

echo "Adding 50 fictional movie characters..."
echo ""

count=0
for character in "${characters[@]}"; do
  IFS='|' read -r name email age <<< "$character"

  count=$((count + 1))
  echo "[$count/50] Adding: $name"

  curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"email\": \"$email\",
      \"age\": $age
    }" > /dev/null

  if [ $? -eq 0 ]; then
    echo "  ✓ Success"
  else
    echo "  ✗ Failed"
  fi
done

echo ""
echo "Done! Added $count characters."
echo ""
echo "Total users in database:"
curl -s "$BASE_URL" | jq '. | length'
