from amadeus import Client, ResponseError
from amadeus import Location
import matplotlib.pyplot as plt
import pandas as pd



amadeus = Client(
    client_id='wOP6GXg3KnAIx0e5MhqwwG9Ll4zAvvdY',
    client_secret='qpBFXr6YvyhP6sgw'
)

# response = amadeus.reference_data.locations.get(
#     keyword='LON',
#     subType=Location.ANY
# )
#
# print(response.body) #=> The raw response, as a string
# print(response.result) #=> The body parsed as JSON, if the result was parsable
# print(response.data) #=> The list of locations, extracted from the JSON


response = amadeus.shopping.flight_destinations.get(origin='LON')
# Extract required data
data = response.data  # This contains the list of flight destinations


destinations = [entry["destination"] for entry in data]
prices = [float(entry["price"]["total"]) for entry in data]

print(destinations)
# Create DataFrame
df = pd.DataFrame({"Destination": destinations, "Price": prices})
# Plot bar chart
plt.figure(figsize=(10, 5))
plt.bar(df["Destination"], df["Price"], color='skyblue')
plt.xlabel("Destination")
plt.ylabel("Price (in Pound Sterling)")
plt.title("Flight Prices from LON")
plt.xticks(rotation=45)
plt.grid(axis='y', linestyle='--', alpha=0.7)

# Show the plot
plt.show()