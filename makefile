include .env
export $(shell sed 's/=.*//' .env) 

run:
	deno run --allow-net --allow-env example.ts