from zoneinfo import ZoneInfo
import zoneinfo
# from datetime import datetime


all_zones = zoneinfo.available_timezones()
times_zones = {"misc": []}
for i in all_zones:
    if "/" in i:
        print(i)
        time_zone = i.split("/")
        if time_zone.__len__() > 2:
            country = time_zone[0]
            time_zone.remove(country)
            province = "/".join(time_zone)
        else:
            country, province = time_zone
        if country not in times_zones.keys():
            times_zones[country] = []
        times_zones[country].append(province)
    else:
        times_zones["misc"].append(i)





for i in times_zones.keys():
    print("-------------------------", i, "-------------------------")
    print(times_zones[i], "\n")


# now_et = datetime.now(ZoneInfo("America/New_York"))
# day = now_et.strftime("%B; %d; %Y; %H:%M")